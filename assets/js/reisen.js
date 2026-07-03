/**
 * Baut aus den Daten in reisen-data.js:
 * - die Karten auf der Startseite (renderKarten)
 * - die Tabelle auf der Datenübersicht (renderTabelle)
 * - die Detailseite mit Fotogalerie (renderDetail)
 *
 * Läuft synchron, BEVOR main.js startet -> GLightbox findet die neu
 * eingefügten Bilder automatisch (Reihenfolge der <script>-Tags beachten!).
 */

function bildpfad(reise, index) {
  const nummer = String(index).padStart(4, "0");
  return `assets/img/${reise.ordner}/${reise.praefix}-${nummer}.jpg`;
}

// ---------- Startseite: Karten ----------
function renderKarten(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = reisen.map(reise => `
    <div class="gallery-item">
      <div class="gallery-img-wrap">
        <img src="${bildpfad(reise, 1)}" class="img-fluid" alt="${reise.titel}" loading="lazy" decoding="async">
        <div class="gallery-links d-flex align-items-center justify-content-center">
          <a href="${bildpfad(reise, 1)}" title="${reise.titel}" class="glightbox preview-link"><i class="bi bi-arrows-angle-expand"></i></a>
          <a href="reise-detail.html?ort=${reise.id}" class="details-link"><i class="bi bi-link-45deg"></i></a>
        </div>
      </div>
      <div class="pt-2">
        <h3 class="h6 mb-1"><a href="reise-detail.html?ort=${reise.id}">${reise.titel}</a></h3>
        <p class="small mb-0" style="color: color-mix(in srgb, var(--default-color), transparent 25%);">${reise.teaser}</p>
      </div>
    </div>
  `).join("");
}

// ---------- Datenübersicht: Sprungmarken + eine zusammenhängende Tabelle ----------
function slug(text) {
  return text.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderDatenuebersicht(navId, containerId) {
  const nav = document.getElementById(navId);
  const container = document.getElementById(containerId);
  if (!container) return;

  const kategorien = [...new Set(reisen.map(r => r.kategorie))];

  if (nav) {
    nav.innerHTML = kategorien.map(k => `<a href="#kat-${slug(k)}">${k}</a>`).join("");
  }

  const koerper = kategorien.map(kat => {
    const zeilen = reisen.filter(r => r.kategorie === kat).map(reise => `
      <tr>
        <td><a href="reise-detail.html?ort=${reise.id}">${reise.titel}</a></td>
        <td>${reise.ort}</td>
        <td>${reise.zeitraum}</td>
        <td>${reise.anzahl} Fotos</td>
        <td><a href="reise-detail.html?ort=${reise.id}" class="btn-visit">Ansehen</a></td>
      </tr>`).join("");

    return `
      <tbody id="kat-${slug(kat)}">
        <tr class="kategorie-zeile"><td colspan="5">${kat}</td></tr>
        ${zeilen}
      </tbody>`;
  }).join("");

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table table-dark table-hover align-middle">
        <thead>
          <tr><th>Reise / Thema</th><th>Ort</th><th>Zeitraum</th><th>Fotos</th><th></th></tr>
        </thead>
        ${koerper}
      </table>
    </div>`;
}

// ---------- Favoriten: Bento-Galerie ----------
function renderFavoriten(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = favoriten.map(f => {
    const reise = reisen.find(r => r.id === f.ort);
    if (!reise) return "";
    const src = bildpfad(reise, f.index);
    const spanClass = f.groesse === "gross" ? "bento-item bento-gross" : "bento-item";
    return `
      <div class="${spanClass}">
        <img src="${src}" class="img-fluid" alt="${reise.titel}" loading="lazy" decoding="async">
        <div class="bento-overlay">
          <span>${reise.titel}</span>
          <a href="reise-detail.html?ort=${reise.id}" class="glightbox-link"><i class="bi bi-arrow-up-right"></i></a>
        </div>
      </div>`;
  }).join("");
}

// ---------- Detailseite ----------
function renderDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("ort");
  const reise = reisen.find(r => r.id === id) || reisen[0];

  document.title = `${reise.titel} - Işıkta`;

  const setText = (elId, text) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = text;
  };

  setText("detail-titel", reise.titel);
  setText("detail-breadcrumb", reise.titel);
  setText("detail-teaser", reise.teaser);
  setText("detail-beschreibung", reise.beschreibung);
  setText("info-ort", reise.ort);
  setText("info-kategorie", reise.kategorie);
  setText("info-zeitraum", reise.zeitraum);
  setText("info-anzahl", `${reise.anzahl} Fotos`);

  const grid = document.getElementById("detail-galerie");
  if (grid) {
    let bilder = "";
    for (let i = 1; i <= reise.anzahl; i++) {
      const src = bildpfad(reise, i);
      bilder += `
        <div class="gallery-item">
          <div class="gallery-img-wrap">
            <img src="${src}" class="img-fluid" alt="${reise.titel} Foto ${i}" loading="lazy" decoding="async">
            <div class="gallery-links d-flex align-items-center justify-content-center">
              <a href="${src}" title="${reise.titel} ${i}" class="glightbox preview-link" data-gallery="detail-galerie"><i class="bi bi-arrows-angle-expand"></i></a>
            </div>
          </div>
        </div>`;
    }
    grid.innerHTML = bilder;
  }
}