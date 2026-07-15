/**
 * build-data.js
 *
 * Runs automatically on every push (via GitHub Action) and again as a
 * Cloudflare Pages build step. It does three jobs:
 *
 * 1. IMAGE PROCESSING
 *    For every travel folder under assets/img/<ordner>/, looks inside an
 *    "incoming" subfolder for newly dropped/uploaded photos (any format,
 *    any size, any filename). Each one gets resized (max width 2200px)
 *    and converted to WebP, then renamed to the next free
 *    "<praefix>-XXXX.webp" slot in the main folder. The original file in
 *    "incoming" is then deleted.
 *
 * 2. ORDER LIST MAINTENANCE (content/reisen/<id>.json -> "bilder" field)
 *    Each trip's JSON file has a "bilder" array: an ordered list of
 *    filenames, e.g. ["vienna-0001.webp", "vienna-0003.webp", ...].
 *    This is the single source of truth for both the gallery ORDER and
 *    which photos are actually shown.
 *      - Newly processed photos (from step 1) are appended to the end
 *        of this list automatically.
 *      - Any filename in the list that no longer exists on disk (e.g.
 *        deleted directly on GitHub) is dropped automatically.
 *      - Manual reordering or removal done in the admin form (Decap CMS)
 *        is preserved as-is - this script only appends/cleans, it never
 *        reorders existing entries.
 *      - MIGRATION: if a trip has no "bilder" array yet at all (e.g. it
 *        was created before this field existed), the initial order is
 *        bootstrapped automatically from whatever numbered files already
 *        exist on disk, sorted numerically - so nothing disappears.
 *    The updated "bilder" array is written back into
 *    content/reisen/<id>.json so the admin form always reflects the
 *    current, real state.
 *
 * 3. DATA GENERATION
 *    Reads every content/reisen/*.json file plus content/favoriten.json
 *    and writes the final assets/js/reisen-data.js that the website
 *    actually uses, including the ordered "bilder" list per trip.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname);
const CONTENT_REISEN_DIR = path.join(ROOT, "content", "reisen");
const FAVORITEN_PATH = path.join(ROOT, "content", "favoriten.json");
const IMG_DIR = path.join(ROOT, "assets", "img");
const OUTPUT_PATH = path.join(ROOT, "assets", "js", "reisen-data.js");

const MAX_WIDTH = 2200;
const WEBP_QUALITY = 88;
const SUPPORTED_INPUT_EXT = [".jpg", ".jpeg", ".png", ".heic", ".webp", ".tif", ".tiff"];

function log(msg) {
  console.log(`[build-data] ${msg}`);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- Step 1: process "incoming" photos for a single trip ----------
async function processIncoming(ordner, praefix) {
  const folderPath = path.join(IMG_DIR, ordner);
  const incomingPath = path.join(folderPath, "incoming");
  const newlyCreated = [];

  if (!fs.existsSync(incomingPath)) return newlyCreated;

  const incomingFiles = fs
    .readdirSync(incomingPath)
    .filter((f) => SUPPORTED_INPUT_EXT.includes(path.extname(f).toLowerCase()))
    .sort();

  if (incomingFiles.length === 0) return newlyCreated;

  const existing = fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];
  const pattern = new RegExp(`^${escapeRegExp(praefix)}-(\\d{4})\\.webp$`);
  let highestIndex = 0;
  for (const file of existing) {
    const match = file.match(pattern);
    if (match) highestIndex = Math.max(highestIndex, parseInt(match[1], 10));
  }

  log(`${ordner}: found ${incomingFiles.length} new photo(s) in incoming/, starting at index ${highestIndex + 1}`);

  for (const file of incomingFiles) {
    highestIndex += 1;
    const nummer = String(highestIndex).padStart(4, "0");
    const inputPath = path.join(incomingPath, file);
    const outputFilename = `${praefix}-${nummer}.webp`;
    const outputPath = path.join(folderPath, outputFilename);

    await sharp(inputPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    fs.unlinkSync(inputPath);
    newlyCreated.push(outputFilename);
    log(`  -> ${file} => ${outputFilename}`);
  }

  return newlyCreated;
}

// ---------- Step 2: reconcile the ordered "bilder" list ----------
function reconcileBilderList(ordner, praefix, existingList, newlyCreated) {
  const folderPath = path.join(IMG_DIR, ordner);
  const onDisk = fs.existsSync(folderPath)
    ? new Set(fs.readdirSync(folderPath).filter((f) => f.endsWith(".webp")))
    : new Set();

  const toFilename = (entry) => path.basename(entry);

  let cleanedFilenames;

  if (!existingList || existingList.length === 0) {
    const pattern = new RegExp(`^${escapeRegExp(praefix)}-(\\d{4})\\.webp$`);
    cleanedFilenames = [...onDisk]
      .filter((f) => pattern.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(pattern)[1], 10);
        const numB = parseInt(b.match(pattern)[1], 10);
        return numA - numB;
      });
  } else {
    cleanedFilenames = existingList.map(toFilename).filter((f) => onDisk.has(f));
  }

  for (const file of newlyCreated) {
    if (!cleanedFilenames.includes(file)) cleanedFilenames.push(file);
  }

  return cleanedFilenames.map((filename) => `/assets/img/${ordner}/${filename}`);
}

// ---------- Main ----------
async function main() {
  if (!fs.existsSync(CONTENT_REISEN_DIR)) {
    console.error(`Missing folder: ${CONTENT_REISEN_DIR}`);
    process.exit(1);
  }

  const reisenFiles = fs
    .readdirSync(CONTENT_REISEN_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const reisen = [];

  for (const file of reisenFiles) {
    const filePath = path.join(CONTENT_REISEN_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!data.ordner || !data.praefix) {
      console.error(`Trip file ${file} is missing "ordner" or "praefix" - skipping`);
      continue;
    }

    const newlyCreated = await processIncoming(data.ordner, data.praefix);
    const bilder = reconcileBilderList(data.ordner, data.praefix, data.bilder, newlyCreated);

    const { neue_fotos, bilder: _oldBilder, ...rest } = data;
    const updatedData = { ...rest, bilder };
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2) + "\n", "utf-8");

    reisen.push({ ...updatedData, anzahl: bilder.length });
    log(`${data.id}: ${bilder.length} photo(s) total`);
  }

  const favoriten = fs.existsSync(FAVORITEN_PATH)
    ? JSON.parse(fs.readFileSync(FAVORITEN_PATH, "utf-8"))
    : [];

  const output = `/**
 * AUTO-GENERATED FILE - do not edit by hand.
 * Generated by build-data.js from content/reisen/*.json and content/favoriten.json.
 */

const reisen = ${JSON.stringify(reisen, null, 2)};

const favoriten = ${JSON.stringify(favoriten, null, 2)};
`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, output, "utf-8");
  log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});