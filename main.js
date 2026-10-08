// ===== CONFIGURACIÓN: lo único que tienes que editar =====
const CONFIG = {
  nombre: "Juan Diego Guio",
  ubicacion: "Oviedo, Asturias · también en remoto",
  email: "juandidtsl@gmail.com",
  whatsapp: "",      // con prefijo y sin espacios, p. ej. "34612345678". Vacío = no se muestra
  github: "Juandi-DT", // tu usuario de GitHub. Vacío = sin enlaces al código
  repositorio: "",   // nombre del repositorio; si lo dejas vacío se usa "<usuario>.github.io"
};
// =========================================================

const $ = (id) => document.getElementById(id);

// Textos que salen de la configuración
document.querySelectorAll("[data-config]").forEach((el) => {
  const valor = CONFIG[el.dataset.config];
  if (valor) el.textContent = valor;
});
$("anio").textContent = new Date().getFullYear();

// Hora en la comanda, como la que imprime la cocina
const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
$("comanda-hora").textContent = `${new Date().toLocaleDateString("es-ES")} ${hora}`;

// Enlaces "Ver el código" a GitHub (se ocultan si no hay usuario configurado)
const repo = CONFIG.repositorio || (CONFIG.github ? `${CONFIG.github}.github.io` : "");
document.querySelectorAll("[data-codigo]").forEach((a) => {
  if (!CONFIG.github) { a.hidden = true; return; }
  a.href = `https://github.com/${CONFIG.github}/${repo}/tree/main/${a.dataset.codigo}`;
  a.target = "_blank";
  a.rel = "noopener";
});
if (CONFIG.github) {
  const gh = $("enlace-github");
  gh.href = `https://github.com/${CONFIG.github}`;
  gh.textContent = `GitHub: ${CONFIG.github}`;
  gh.hidden = false;
}

// WhatsApp
if (CONFIG.whatsapp) {
  const mensaje = encodeURIComponent("Hola Juan Diego, he visto tu web y quería pedirte presupuesto para…");
  $("enlace-whatsapp").href = `https://wa.me/${CONFIG.whatsapp}?text=${mensaje}`;
  $("whatsapp-texto").textContent = "+" + CONFIG.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
  $("via-whatsapp").hidden = false;
}

// Copiar correo
$("copiar-email").addEventListener("click", async () => {
  const aviso = $("copiado");
  try {
    await navigator.clipboard.writeText(CONFIG.email);
    aviso.textContent = "Correo copiado. Pégalo en tu programa de correo.";
  } catch {
    const rango = document.createRange();
    rango.selectNodeContents($("email-texto"));
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(rango);
    aviso.textContent = "Correo seleccionado: cópialo con Ctrl+C.";
  }
});
