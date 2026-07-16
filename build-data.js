/**
 * build-data.js
 *
 * Runs automatically on every push (via GitHub Action) and again as a
 * Cloudflare Pages build step.
 *
 * 1. IMAGE PROCESSING - processes assets/img/<ordner>/incoming/ photos,
 *    resizing/converting to WebP, appending to an ordered "bilder" list.
 * 2. VIDEO PROCESSING - processes assets/videos/<ordner>/incoming/ clips,
 *    compressing to stay under Cloudflare's 25 MiB per-file limit,
 *    generating a poster frame, appending to an ordered "videos" list.
 * 3. DATA GENERATION - writes assets/js/reisen-data.js for the website.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname);
const CONTENT_REISEN_DIR = path.join(ROOT, "content", "reisen");
const FAVORITEN_PATH = path.join(ROOT, "content", "favoriten.json");
const IMG_DIR = path.join(ROOT, "assets", "img");
const VIDEO_DIR = path.join(ROOT, "assets", "videos");
const OUTPUT_PATH = path.join(ROOT, "assets", "js", "reisen-data.js");

const MAX_WIDTH = 2200;
const WEBP_QUALITY = 88;
const SUPPORTED_INPUT_EXT = [".jpg", ".jpeg", ".png", ".heic", ".webp", ".tif", ".tiff"];

const MAX_VIDEO_MB = 20; // stay comfortably under Cloudflare Pages' 25 MiB per-file limit
const MAX_VIDEO_HEIGHT = 1280;
const MAX_VIDEO_KBPS = 4000;
const SUPPORTED_VIDEO_EXT = [".mp4", ".mov", ".m4v", ".webm", ".avi"];

function log(msg) {
  console.log(`[build-data] ${msg}`);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFfmpegPath() {
  try {
    return require("ffmpeg-static");
  } catch (e) {
    return "ffmpeg";
  }
}

function getVideoDurationSeconds(ffmpegPath, filePath) {
  try {
    execFileSync(ffmpegPath, ["-i", filePath], { stdio: ["ignore", "ignore", "pipe"] });
    return 10;
  } catch (e) {
    const stderr = e.stderr ? e.stderr.toString() : "";
    const match = stderr.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (!match) return 10;
    return parseInt(match[1], 10) * 3600 + parseInt(match[2], 10) * 60 + parseFloat(match[3]);
  }
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

// ---------- Video: process "incoming" clips for a single trip ----------
async function processIncomingVideos(ordner, praefix) {
  const folderPath = path.join(VIDEO_DIR, ordner);
  const incomingPath = path.join(folderPath, "incoming");
  const newlyCreated = [];

  if (!fs.existsSync(incomingPath)) return newlyCreated;

  const incomingFiles = fs
    .readdirSync(incomingPath)
    .filter((f) => SUPPORTED_VIDEO_EXT.includes(path.extname(f).toLowerCase()))
    .sort();

  if (incomingFiles.length === 0) return newlyCreated;

  fs.mkdirSync(folderPath, { recursive: true });

  const existing = fs.readdirSync(folderPath);
  const pattern = new RegExp(`^${escapeRegExp(praefix)}-video-(\\d{4})\\.mp4$`);
  let highestIndex = 0;
  for (const file of existing) {
    const match = file.match(pattern);
    if (match) highestIndex = Math.max(highestIndex, parseInt(match[1], 10));
  }

  const ffmpegPath = getFfmpegPath();

  log(`${ordner}: found ${incomingFiles.length} new video(s) in incoming/, starting at index ${highestIndex + 1}`);

  for (const file of incomingFiles) {
    highestIndex += 1;
    const nummer = String(highestIndex).padStart(4, "0");
    const inputPath = path.join(incomingPath, file);
    const outputFilename = `${praefix}-video-${nummer}.mp4`;
    const posterFilename = `${praefix}-video-${nummer}-poster.jpg`;
    const outputPath = path.join(folderPath, outputFilename);
    const posterPath = path.join(folderPath, posterFilename);

    const duration = getVideoDurationSeconds(ffmpegPath, inputPath);
    const targetKbps = Math.min(
      MAX_VIDEO_KBPS,
      Math.max(300, Math.floor((MAX_VIDEO_MB * 8192) / duration) - 128)
    );

    execFileSync(ffmpegPath, [
      "-y",
      "-i", inputPath,
      "-vf", `scale=-2:'min(${MAX_VIDEO_HEIGHT},ih)'`,
      "-c:v", "libx264",
      "-b:v", `${targetKbps}k`,
      "-preset", "medium",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputPath,
    ]);

    execFileSync(ffmpegPath, [
      "-y",
      "-i", outputPath,
      "-ss", "00:00:01",
      "-frames:v", "1",
      "-update", "1",
      posterPath,
    ]);

    fs.unlinkSync(inputPath);
    newlyCreated.push(outputFilename);
    log(`  -> ${file} => ${outputFilename} (poster: ${posterFilename})`);
  }

  return newlyCreated;
}

function reconcileVideoList(ordner, existingList, newlyCreated) {
  const folderPath = path.join(VIDEO_DIR, ordner);
  const onDisk = fs.existsSync(folderPath)
    ? new Set(fs.readdirSync(folderPath).filter((f) => f.endsWith(".mp4")))
    : new Set();

  const toFilename = (entry) => path.basename(entry);

  const cleanedFilenames = (existingList || [])
    .map(toFilename)
    .filter((f) => onDisk.has(f));

  for (const file of newlyCreated) {
    if (!cleanedFilenames.includes(file)) cleanedFilenames.push(file);
  }

  return cleanedFilenames.map((filename) => ({
    video: `/assets/videos/${ordner}/${filename}`,
    poster: `/assets/videos/${ordner}/${filename.replace(/\.mp4$/, "-poster.jpg")}`,
  }));
}

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

    const newlyCreatedVideos = await processIncomingVideos(data.ordner, data.praefix);
    const videos = reconcileVideoList(data.ordner, data.videos, newlyCreatedVideos);

    const { neue_fotos, neue_videos, bilder: _oldBilder, videos: _oldVideos, ...rest } = data;
    const updatedData = { ...rest, bilder, videos };
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2) + "\n", "utf-8");

    reisen.push({ ...updatedData, anzahl: bilder.length });
    log(`${data.id}: ${bilder.length} photo(s), ${videos.length} video(s) total`);
  }

  const favoritenFile = fs.existsSync(FAVORITEN_PATH)
    ? JSON.parse(fs.readFileSync(FAVORITEN_PATH, "utf-8"))
    : { favoriten: [] };
  const favoriten = favoritenFile.favoriten || [];

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