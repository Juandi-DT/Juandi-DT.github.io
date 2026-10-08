// Sidrería La Tonada — JavaScript sin librerías.
// Datos del negocio arriba: para adaptar la web a otro local, solo se toca este bloque.

const NEGOCIO = {
  nombre: "Sidrería La Tonada",
  whatsapp: "34600000000", // número ficticio: en un cliente real va su número con prefijo 34
  zonaHoraria: "Europe/Madrid",
  // 0 = domingo ... 6 = sábado. Cada día, lista de tramos [apertura, cierre].
  horario: {
    0: [["12:30", "16:30"]],
    1: [],
    2: [["12:30", "16:00"], ["20:00", "23:30"]],
    3: [["12:30", "16:00"], ["20:00", "23:30"]],
    4: [["12:30", "16:00"], ["20:00", "23:30"]],
    5: [["12:30", "16:00"], ["20:00", "00:30"]],
    6: [["12:30", "16:30"], ["20:00", "00:30"]],
  },
  maxPersonas: 12,
};

const CARTA = {
  compartir: [
    { nombre: "Tabla de quesos asturianos", desc: "Cabrales, Afuega'l Pitu, Gamonéu y Casín con membrillo casero.", precio: 16.5 },
    { nombre: "Chorizo a la sidra", desc: "Chorizo de Tineo guisado lentamente en sidra natural.", precio: 9 },
    { nombre: "Tortos con picadillo", desc: "Tortas de maíz fritas con picadillo de la casa y huevo.", precio: 12 },
    { nombre: "Croquetas de jamón", desc: "Ocho unidades, bechamel con leche de la cooperativa.", precio: 10 },
  ],
  platos: [
    { nombre: "Fabada asturiana", desc: "Con su compango completo. Solo los jueves.", precio: 14.5, etiqueta: "Jueves" },
    { nombre: "Cachopo de ternera", desc: "Ternera asturiana, jamón y queso de la tierra. Para dos personas.", precio: 26 },
    { nombre: "Pixín a la plancha", desc: "Rape del Cantábrico con ajada y patatas panaderas.", precio: 22 },
    { nombre: "Merluza a la sidra", desc: "Merluza del pincho en salsa de sidra y almejas.", precio: 19.5 },
    { nombre: "Escalopines al Cabrales", desc: "Solomillo de ternera en salsa de queso Cabrales.", precio: 18 },
  ],
  postres: [
    { nombre: "Arroz con leche requemado", desc: "Hecho a fuego lento, con la costra de azúcar quemada al momento.", precio: 5.5 },
    { nombre: "Frixuelos", desc: "Crepes asturianas con crema y chocolate.", precio: 5 },
    { nombre: "Tarta de queso Casín", desc: "Al horno, cremosa por dentro.", precio: 6 },
  ],
  bebida: [
    { nombre: "Sidra natural", desc: "Botella de 70 cl, escanciada en mesa.", precio: 4.5 },
    { nombre: "Sidra de nueva expresión", desc: "Botella de 75 cl, para tomar en copa.", precio: 9 },
    { nombre: "Vino de la casa", desc: "Copa de tinto o blanco.", precio: 2.8 },
    { nombre: "Agua mineral", desc: "50 cl.", precio: 2 },
  ],
};

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const $ = (id) => document.getElementById(id);
const precio = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

/* ---------- Hora local de Oviedo (aunque el visitante esté en otro huso) ---------- */
function ahoraEnOviedo() {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("es-ES", {
      timeZone: NEGOCIO.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
    }).formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const fecha = new Date(`${partes.year}-${partes.month}-${partes.day}T00:00:00`);
  return { fecha, dia: fecha.getDay(), minutos: Number(partes.hour) * 60 + Number(partes.minute) };
}
const aMinutos = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
// Un cierre a las 00:30 se trata como 24:30 del mismo día.
const cierreEnMinutos = (apertura, cierre) => { const c = aMinutos(cierre); return c <= aMinutos(apertura) ? c + 1440 : c; };

/* ---------- Estado abierto / cerrado ---------- */
function pintarEstado() {
  const { dia, minutos } = ahoraEnOviedo();
  const el = $("estado");
  const ayer = (dia + 6) % 7;
  // ¿Seguimos en un tramo de ayer que acaba pasada la medianoche?
  const deAyer = NEGOCIO.horario[ayer].find(([a, c]) => cierreEnMinutos(a, c) > 1440 && minutos < cierreEnMinutos(a, c) - 1440);
  const tramo = deAyer || NEGOCIO.horario[dia].find(([a, c]) => minutos >= aMinutos(a) && minutos < cierreEnMinutos(a, c));
  if (tramo) {
    el.textContent = `Abierto ahora · cierra a las ${tramo[1]}`;
    el.className = "estado abierto";
    return;
  }
  const siguienteHoy = NEGOCIO.horario[dia].find(([a]) => aMinutos(a) > minutos);
  if (siguienteHoy) {
    el.textContent = `Cerrado ahora · abre hoy a las ${siguienteHoy[0]}`;
  } else {
    for (let i = 1; i <= 7; i++) {
      const d = (dia + i) % 7;
      if (NEGOCIO.horario[d].length) {
        el.textContent = `Cerrado ahora · abre ${i === 1 ? "mañana" : "el " + DIAS[d].toLowerCase()} a las ${NEGOCIO.horario[d][0][0]}`;
        break;
      }
    }
  }
  el.className = "estado cerrado";
}

/* ---------- Horario ---------- */
function pintarHorario() {
  const hoy = ahoraEnOviedo().dia;
  const orden = [1, 2, 3, 4, 5, 6, 0]; // de lunes a domingo
  $("tabla-horario").innerHTML = orden.map((d) => {
    const tramos = NEGOCIO.horario[d];
    const texto = tramos.length ? tramos.map(([a, c]) => `${a}–${c}`).join(" y ") : "Cerrado";
    return `<tr class="${d === hoy ? "hoy" : ""}"><th scope="row">${DIAS[d]}</th><td class="${tramos.length ? "" : "cerrado"}">${texto}</td></tr>`;
  }).join("");
}

/* ---------- Carta con pestañas accesibles ---------- */
function pintarCarta(seccion) {
  $("lista-platos").innerHTML = CARTA[seccion].map((p) => `
    <li>
      <span class="plato-nombre">${p.nombre}${p.etiqueta ? `<span class="etiqueta">${p.etiqueta}</span>` : ""}</span>
      <span class="plato-precio">${precio(p.precio)}</span>
      <span class="plato-desc">${p.desc}</span>
    </li>`).join("");
}
function prepararPestanas() {
  const pestanas = [...document.querySelectorAll('[role="tab"]')];
  const activar = (tab) => {
    pestanas.forEach((t) => { t.setAttribute("aria-selected", t === tab); t.tabIndex = t === tab ? 0 : -1; });
    $("panel-carta").setAttribute("aria-labelledby", tab.id);
    pintarCarta(tab.dataset.seccion);
  };
  pestanas.forEach((tab, i) => {
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.addEventListener("click", () => activar(tab));
    tab.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      const siguiente = pestanas[(i + dir + pestanas.length) % pestanas.length];
      siguiente.focus();
      activar(siguiente);
    });
  });
  pintarCarta("compartir");
}

/* ---------- Reservas ---------- */
function isoLocal(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}
function horasDisponibles(isoFecha) {
  const fecha = new Date(`${isoFecha}T00:00:00`);
  const { fecha: hoy, minutos: ahora } = ahoraEnOviedo();
  const esHoy = isoLocal(fecha) === isoLocal(hoy);
  const horas = [];
  for (const [a, c] of NEGOCIO.horario[fecha.getDay()]) {
    // Última reserva una hora antes del cierre, cada 30 minutos.
    for (let m = aMinutos(a); m <= cierreEnMinutos(a, c) - 60; m += 30) {
      if (esHoy && m < ahora + 60) continue; // hoy, con al menos una hora de margen
      horas.push(`${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    }
  }
  return horas;
}
function actualizarHoras() {
  const sel = $("hora");
  const valor = $("fecha").value;
  if (!valor) { sel.disabled = true; sel.innerHTML = '<option value="">Elige primero el día</option>'; return; }
  const horas = horasDisponibles(valor);
  sel.disabled = !horas.length;
  sel.innerHTML = horas.length
    ? horas.map((h) => `<option value="${h}">${h}</option>`).join("")
    : '<option value="">Ese día no abrimos o ya no quedan horas</option>';
}
function prepararReservas() {
  $("personas").innerHTML = Array.from({ length: NEGOCIO.maxPersonas }, (_, i) =>
    `<option value="${i + 1}"${i === 1 ? " selected" : ""}>${i + 1} ${i === 0 ? "persona" : "personas"}</option>`).join("");

  const hoy = ahoraEnOviedo().fecha;
  const limite = new Date(hoy); limite.setDate(limite.getDate() + 60);
  $("fecha").min = isoLocal(hoy);
  $("fecha").max = isoLocal(limite);
  $("fecha").addEventListener("change", actualizarHoras);

  const form = $("form-reserva");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errores = [];
    const nombre = $("nombre").value.trim();
    $("nombre").setAttribute("aria-invalid", !nombre);
    if (!nombre) errores.push("Escribe tu nombre.");
    const fecha = $("fecha").value;
    const fechaValida = fecha && fecha >= $("fecha").min && fecha <= $("fecha").max;
    $("fecha").setAttribute("aria-invalid", !fechaValida);
    if (!fechaValida) errores.push("Elige un día entre hoy y los próximos 60 días.");
    if (fechaValida && !$("hora").value) errores.push("Ese día no hay horas libres: prueba otro día.");

    const error = $("error-reserva");
    if (errores.length) {
      error.textContent = errores.join(" ");
      error.hidden = false;
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    error.hidden = true;

    const diaTexto = new Date(`${fecha}T00:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const notas = $("notas").value.trim();
    const mensaje = [
      `Hola, quiero reservar en ${NEGOCIO.nombre}:`,
      `Nombre: ${nombre}`,
      `Personas: ${$("personas").value}`,
      `Día: ${diaTexto}`,
      `Hora: ${$("hora").value}`,
      notas ? `Notas: ${notas}` : "",
    ].filter(Boolean).join("\n");

    $("texto-resumen").textContent = mensaje;
    $("enlace-whatsapp").href = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    form.hidden = true;
    $("resumen-reserva").hidden = false;
    $("enlace-whatsapp").focus();
  });

  $("editar-reserva").addEventListener("click", () => {
    $("resumen-reserva").hidden = true;
    form.hidden = false;
    $("nombre").focus();
  });
}

pintarEstado();
pintarHorario();
prepararPestanas();
prepararReservas();
setInterval(pintarEstado, 60_000);
