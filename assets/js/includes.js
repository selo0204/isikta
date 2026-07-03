async function ladeTeil(url, zielId) {
  const ziel = document.getElementById(zielId);
  if (!ziel) return;
  try {
    const antwort = await fetch(url);
    ziel.innerHTML = await antwort.text();
  } catch (fehler) {
    console.error(
      `Konnte ${url} nicht laden. Läuft die Seite über einen lokalen Server (nicht file://)?`,
      fehler
    );
  }
}

function aktivenNavLinkSetzen() {
  const aktuelleSeite = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#navmenu > ul > li > a").forEach(link => {
    if (link.getAttribute("href") === aktuelleSeite) {
      link.classList.add("active");
    }
  });
}

function mainJsNachladen() {
  // main.js braucht Header & Footer im DOM (Mobile-Nav-Button, Scroll-Verhalten
  // etc.), deshalb wird es erst NACH dem Einfügen gestartet.
  const script = document.createElement("script");
  script.src = "assets/js/main.js";
  document.body.appendChild(script);
}

Promise.all([
  ladeTeil("header.html", "site-header"),
  ladeTeil("footer.html", "site-footer")
]).then(() => {
  aktivenNavLinkSetzen();
  mainJsNachladen();
});
