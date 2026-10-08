// Calculadora de escandallos — JavaScript sin librerías.
//
// Fórmulas:
//   cantidad a comprar = cantidad en el plato / (1 − merma)
//   coste ingrediente  = cantidad a comprar × precio de compra
//   coste por ración   = coste total / raciones
//   PVP sin IVA        = coste por ración / food cost objetivo
//   PVP con IVA        = PVP sin IVA × (1 + IVA)

const CLAVE = "escandallos.v1";
const $ = (id) => document.getElementById(id);
const euros = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : 0; };
const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Unidad de la receta -> [factor a la unidad de precio, texto del precio]
const UNIDADES = { g: [1 / 1000, "€/kg"], kg: [1, "€/kg"], ml: [1 / 1000, "€/l"], l: [1, "€/l"], ud: [1, "€/ud"] };

const EJEMPLO = {
  nombre: "Cachopo de ternera (ejemplo)",
  raciones: 2, objetivo: 30, iva: 10,
  ingredientes: [
    { nombre: "Filetes de ternera", cantidad: 400, unidad: "g", precio: 14.9, merma: 10 },
    { nombre: "Jamón serrano", cantidad: 100, unidad: "g", precio: 18, merma: 0 },
    { nombre: "Queso para fundir", cantidad: 120, unidad: "g", precio: 12, merma: 0 },
    { nombre: "Huevo", cantidad: 2, unidad: "ud", precio: 0.25, merma: 0 },
    { nombre: "Pan rallado", cantidad: 80, unidad: "g", precio: 2.4, merma: 0 },
    { nombre: "Harina", cantidad: 40, unidad: "g", precio: 0.9, merma: 0 },
    { nombre: "Aceite de girasol (absorbido)", cantidad: 150, unidad: "ml", precio: 2.2, merma: 0 },
    { nombre: "Patata", cantidad: 400, unidad: "g", precio: 1.0, merma: 20 },
    { nombre: "Pimiento del piquillo", cantidad: 100, unidad: "g", precio: 6.5, merma: 0 },
  ],
};

let receta = null;

/* ---------- almacenamiento (puede fallar en modo privado: la app sigue funcionando) ---------- */
function leerGuardado() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || { recetas: [], borrador: null }; }
  catch { return { recetas: [], borrador: null }; }
}
function escribirGuardado(datos) {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); return true; } catch { return false; }
}

/* ---------- cálculo ---------- */
function costeIngrediente(i) {
  const [factor] = UNIDADES[i.unidad] || UNIDADES.g;
  const merma = Math.min(num(i.merma), 95) / 100;
  return (num(i.cantidad) * factor / (1 - merma)) * num(i.precio);
}
function calcular(r) {
  const total = r.ingredientes.reduce((s, i) => s + costeIngrediente(i), 0);
  const raciones = Math.max(1, Math.round(num(r.raciones)));
  const objetivo = Math.min(Math.max(num(r.objetivo), 5), 90) / 100;
  const iva = Math.max(num(r.iva), 0) / 100;
  const racion = total / raciones;
  const pvpSin = racion / objetivo;
  return { total, racion, pvpSin, pvpCon: pvpSin * (1 + iva), margen: pvpSin - racion, iva };
}

/* ---------- pintar ---------- */
function pintarResultado() {
  const r = calcular(receta);
  const hayDatos = r.total > 0;
  $("r-total").textContent = hayDatos ? euros(r.total) : "—";
  $("r-racion").textContent = hayDatos ? euros(r.racion) : "—";
  $("r-pvp").textContent = hayDatos ? euros(r.pvpCon) : "—";
  $("r-pvp-sin").textContent = hayDatos ? `${euros(r.pvpSin)} sin IVA, con un food cost del ${num(receta.objetivo)} %` : "Añade ingredientes con cantidad y precio.";
  $("r-margen").textContent = hayDatos ? euros(r.margen) : "—";

  const real = num($("pvp-real").value);
  const el = $("r-real");
  if (!hayDatos || !real) {
    el.textContent = "Escribe el precio de carta para ver tu food cost real.";
    el.className = "veredicto";
    return;
  }
  const sinIva = real / (1 + r.iva);
  const fc = (r.racion / sinIva) * 100;
  const fcTexto = fc.toLocaleString("es-ES", { maximumFractionDigits: 1 });
  if (fc <= num(receta.objetivo)) {
    el.textContent = `Food cost del ${fcTexto} %. Te quedan ${euros(sinIva - r.racion)} por ración antes de personal y gastos.`;
    el.className = "veredicto bien";
  } else {
    el.textContent = `Food cost del ${fcTexto} %: por encima de tu objetivo. Para llegar al ${num(receta.objetivo)} % tendrías que cobrar ${euros(r.pvpCon)}.`;
    el.className = "veredicto mal";
  }
}

function pintarFila(ing, indice) {
  const fila = $("plantilla-fila").content.firstElementChild.cloneNode(true);
  const campos = { nombre: ".i-nombre", cantidad: ".i-cantidad", unidad: ".i-unidad", precio: ".i-precio", merma: ".i-merma" };
  for (const [clave, sel] of Object.entries(campos)) {
    const input = fila.querySelector(sel);
    input.value = ing[clave] ?? "";
    input.addEventListener("input", () => {
      receta.ingredientes[indice][clave] = input.value;
      if (clave === "unidad") fila.querySelector(".i-por").textContent = UNIDADES[input.value][1];
      actualizarCosteFila(fila, indice);
      pintarResultado();
      guardarBorrador();
    });
  }
  fila.querySelector(".i-por").textContent = (UNIDADES[ing.unidad] || UNIDADES.g)[1];
  fila.querySelector(".quitar").addEventListener("click", () => {
    receta.ingredientes.splice(indice, 1);
    pintarTodo();
    guardarBorrador();
  });
  actualizarCosteFila(fila, indice);
  return fila;
}
function actualizarCosteFila(fila, indice) {
  const coste = costeIngrediente(receta.ingredientes[indice]);
  fila.querySelector(".i-coste").textContent = coste > 0 ? euros(coste) : "—";
}

function pintarTodo() {
  $("nombre").value = receta.nombre;
  $("raciones").value = receta.raciones;
  $("objetivo").value = receta.objetivo;
  $("iva").value = receta.iva;
  const tbody = $("filas");
  tbody.replaceChildren(...receta.ingredientes.map(pintarFila));
  pintarResultado();
}

function pintarLista() {
  const { recetas } = leerGuardado();
  const ul = $("lista-recetas");
  if (!recetas.length) {
    ul.innerHTML = '<li class="vacio">Aún no has guardado ninguna receta. Pulsa "Guardar receta" y aparecerá aquí.</li>';
    return;
  }
  ul.replaceChildren(...recetas.map((r) => {
    const li = document.createElement("li");
    const c = calcular(r);
    li.innerHTML = `<span class="titulo-receta"></span>
      <button type="button" data-accion="abrir">Abrir</button>
      <button type="button" data-accion="duplicar">Duplicar</button>
      <button type="button" data-accion="borrar">Borrar</button>`;
    const titulo = li.querySelector(".titulo-receta");
    titulo.textContent = r.nombre || "Sin nombre";
    const sub = document.createElement("small");
    sub.textContent = `${euros(c.racion)} por ración · PVP ${euros(c.pvpCon)}`;
    titulo.append(sub);
    li.addEventListener("click", (e) => {
      const boton = e.target.closest("button");
      if (!boton) return;
      const accion = boton.dataset.accion;
      if (accion === "abrir") { receta = structuredClone(r); pintarTodo(); guardarBorrador(); avisar(`Abierta: ${r.nombre}`); window.scrollTo({ top: 0, behavior: "smooth" }); }
      if (accion === "duplicar") { receta = { ...structuredClone(r), id: nuevoId(), nombre: `${r.nombre} (copia)` }; pintarTodo(); guardarBorrador(); avisar("Copia lista para editar. Guárdala cuando acabes."); }
      if (accion === "borrar") {
        if (!boton.classList.contains("confirmar")) {
          boton.classList.add("confirmar");
          boton.textContent = "Pulsa otra vez para borrar";
          setTimeout(() => { boton.classList.remove("confirmar"); boton.textContent = "Borrar"; }, 4000);
          return;
        }
        const datos = leerGuardado();
        datos.recetas = datos.recetas.filter((x) => x.id !== r.id);
        escribirGuardado(datos);
        pintarLista();
        avisar(`Borrada: ${r.nombre}`);
      }
    });
    return li;
  }));
}

function avisar(texto) {
  $("aviso").textContent = texto;
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => { $("aviso").textContent = ""; }, 4000);
}

/* ---------- acciones ---------- */
function guardarBorrador() {
  const datos = leerGuardado();
  datos.borrador = receta;
  escribirGuardado(datos);
}

function exportarCSV() {
  const c = calcular(receta);
  const f = (n) => n.toFixed(2).replace(".", ",");
  const filas = [
    ["Plato", receta.nombre], ["Raciones", receta.raciones], [],
    ["Ingrediente", "En el plato", "Unidad", "Precio de compra", "Unidad de precio", "Merma %", "Coste (€)"],
    ...receta.ingredientes.map((i) => [i.nombre, i.cantidad, i.unidad, i.precio, UNIDADES[i.unidad][1], i.merma || 0, f(costeIngrediente(i))]),
    [], ["Coste receta", f(c.total)], ["Coste por ración", f(c.racion)],
    ["PVP sin IVA", f(c.pvpSin)], ["PVP con IVA", f(c.pvpCon)], ["Margen bruto por ración", f(c.margen)],
  ];
  const csv = filas.map((fila) => fila.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  enlace.download = `escandallo-${(receta.nombre || "receta").toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, "-")}.csv`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

function iniciar() {
  const datos = leerGuardado();
  receta = datos.borrador ? datos.borrador : { id: nuevoId(), ...structuredClone(EJEMPLO) };

  for (const id of ["nombre", "raciones", "objetivo", "iva"]) {
    $(id).addEventListener("input", () => { receta[id] = $(id).value; pintarResultado(); guardarBorrador(); });
  }
  $("pvp-real").addEventListener("input", pintarResultado);
  $("anadir").addEventListener("click", () => {
    receta.ingredientes.push({ nombre: "", cantidad: "", unidad: "g", precio: "", merma: 0 });
    pintarTodo();
    $("filas").lastElementChild.querySelector(".i-nombre").focus();
  });
  $("nueva").addEventListener("click", () => {
    receta = { id: nuevoId(), nombre: "", raciones: 1, objetivo: 30, iva: 10, ingredientes: [{ nombre: "", cantidad: "", unidad: "g", precio: "", merma: 0 }] };
    $("pvp-real").value = "";
    pintarTodo();
    guardarBorrador();
    $("nombre").focus();
  });
  $("guardar").addEventListener("click", () => {
    if (!receta.nombre.trim()) { $("nombre").focus(); avisar("Ponle nombre al plato antes de guardarlo."); return; }
    const datos = leerGuardado();
    const i = datos.recetas.findIndex((r) => r.id === receta.id);
    if (i >= 0) datos.recetas[i] = structuredClone(receta); else datos.recetas.unshift(structuredClone(receta));
    avisar(escribirGuardado(datos) ? `Guardada: ${receta.nombre}` : "Este navegador no permite guardar (¿modo privado?). Descarga el CSV para no perderla.");
    pintarLista();
  });
  $("exportar").addEventListener("click", exportarCSV);
  $("imprimir").addEventListener("click", () => window.print());

  pintarTodo();
  pintarLista();
}

iniciar();
