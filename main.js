// ===== CONFIGURACIÓN: lo único que tienes que editar =====
const CONFIG = {
  nombre: "Juan Diego Guio",
  email: "juandidtsl@gmail.com",
  whatsapp: "34642639674", // con prefijo y sin espacios. Vacío = no se muestra
  github: "Juandi-DT",     // tu usuario de GitHub. Vacío = sin enlaces al código
  repositorio: "",         // nombre del repositorio; si lo dejas vacío se usa "<usuario>.github.io"
};
// Los textos de la página (en español y en inglés) están en textos.js
// =========================================================

const $ = (id) => document.getElementById(id);

/* ---------- Idioma ---------- */
const CLAVE_IDIOMA = "portafolio.idioma";
const IDIOMAS = Object.keys(TEXTOS); // ["es", "en"]

function idiomaGuardado() {
  // Se puede forzar con ?lang=en, útil para mandar el enlace ya en inglés.
  const pedido = new URLSearchParams(location.search).get("lang");
  if (IDIOMAS.includes(pedido)) return pedido;
  try {
    const guardado = localStorage.getItem(CLAVE_IDIOMA);
    if (IDIOMAS.includes(guardado)) return guardado;
  } catch { /* modo privado: se usa el idioma del navegador */ }
  return (navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en";
}

function aplicarIdioma(idioma) {
  const t = TEXTOS[idioma];

  document.documentElement.lang = idioma;
  document.title = t["doc.titulo"];
  document.querySelector('meta[name="description"]').content = t["doc.descripcion"];
  document.querySelector('meta[property="og:title"]').content = t["doc.titulo"];
  document.querySelector('meta[property="og:description"]').content = t["doc.descripcion"];

  for (const el of document.querySelectorAll("[data-t]")) {
    const texto = t[el.dataset.t];
    if (texto === undefined) continue;
    // Una clave vacía significa "este aviso no va en este idioma".
    el.hidden = texto === "";
    el.textContent = texto;
  }
  for (const el of document.querySelectorAll("[data-t-aria]")) {
    const texto = t[el.dataset.tAria];
    if (texto !== undefined) el.setAttribute("aria-label", texto);
  }

  for (const boton of document.querySelectorAll("#selector-idioma button")) {
    boton.setAttribute("aria-pressed", String(boton.dataset.idioma === idioma));
  }

  pintarHoraComanda(idioma);
  pintarWhatsApp(idioma);
}

function cambiarIdioma(idioma) {
  try { localStorage.setItem(CLAVE_IDIOMA, idioma); } catch { /* da igual: solo no se recuerda */ }
  aplicarIdioma(idioma);
}

/* ---------- Textos que salen de la configuración ---------- */
for (const el of document.querySelectorAll("[data-config]")) {
  const valor = CONFIG[el.dataset.config];
  if (valor) el.textContent = valor;
}
$("anio").textContent = new Date().getFullYear();

/* ---------- Hora en la comanda, como la que imprime la cocina ---------- */
function pintarHoraComanda(idioma) {
  const ahora = new Date();
  const local = idioma === "es" ? "es-ES" : "en-GB";
  const hora = ahora.toLocaleTimeString(local, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  $("comanda-hora").textContent = `${ahora.toLocaleDateString(local)} ${hora}`;
}

/* ---------- WhatsApp ---------- */
function pintarWhatsApp(idioma) {
  if (!CONFIG.whatsapp) return;
  const mensaje = encodeURIComponent(TEXTOS[idioma]["contacto.mensaje"]);
  $("enlace-whatsapp").href = `https://wa.me/${CONFIG.whatsapp}?text=${mensaje}`;
  $("whatsapp-texto").textContent = "+" + CONFIG.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
  $("via-whatsapp").hidden = false;
}

/* ---------- Enlaces "Ver el código" a GitHub ---------- */
const repo = CONFIG.repositorio || (CONFIG.github ? `${CONFIG.github}.github.io` : "");
for (const a of document.querySelectorAll("[data-codigo]")) {
  if (!CONFIG.github) { a.hidden = true; continue; }
  a.href = `https://github.com/${CONFIG.github}/${repo}/tree/main/${a.dataset.codigo}`;
  a.target = "_blank";
  a.rel = "noopener";
}
if (CONFIG.github) {
  const gh = $("enlace-github");
  gh.href = `https://github.com/${CONFIG.github}`;
  gh.textContent = `GitHub: ${CONFIG.github}`;
  gh.hidden = false;
}

/* ---------- Copiar correo ---------- */
$("copiar-email").addEventListener("click", async () => {
  const aviso = $("copiado");
  const t = TEXTOS[document.documentElement.lang] || TEXTOS.es;
  try {
    await navigator.clipboard.writeText(CONFIG.email);
    aviso.textContent = t["contacto.copiado"];
  } catch {
    const rango = document.createRange();
    rango.selectNodeContents($("email-texto"));
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(rango);
    aviso.textContent = t["contacto.copiado_manual"];
  }
});

/* ---------- Selector de idioma ---------- */
for (const boton of document.querySelectorAll("#selector-idioma button")) {
  boton.addEventListener("click", () => cambiarIdioma(boton.dataset.idioma));
}

/* ---------- Secciones que aparecen al llegar a ellas ---------- */
// Si el navegador no lo soporta o el visitante pide menos movimiento, se ven sin más.
const quietas = matchMedia("(prefers-reduced-motion: reduce)").matches;
const secciones = document.querySelectorAll(".revelar");
if (quietas || !("IntersectionObserver" in window)) {
  secciones.forEach((s) => s.classList.add("visible"));
} else {
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  secciones.forEach((s) => observador.observe(s));
}

aplicarIdioma(idiomaGuardado());
