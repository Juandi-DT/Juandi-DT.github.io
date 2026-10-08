"""
Resumen mensual de gastos a partir de facturas de proveedores en Excel o CSV.

Lee todos los .xlsx y .csv de una carpeta, junta las líneas, y genera:
  - un informe HTML listo para abrir o enviar (gasto por proveedor, por
    categoría, productos con más gasto y subidas de precio frente al mes anterior)
  - un CSV con los totales, para abrirlo en Excel
  - un resumen corto en la consola

Solo usa la librería estándar de Python (sin pandas ni openpyxl): un .xlsx
es un .zip con XML dentro y se lee con zipfile + xml.etree.

Uso:
    python resumen_gastos.py                     # último mes con datos
    python resumen_gastos.py --mes 2026-09       # un mes concreto
    python resumen_gastos.py --entrada facturas --salida informes

Columnas que reconoce (da igual mayúsculas, tildes y orden):
    Fecha · Proveedor · Producto (o Concepto, Artículo) · Categoría (o Familia)
    Cantidad (o Uds) · Precio unitario (o Precio) · Total (o Importe)
Si falta Total, se calcula como Cantidad × Precio unitario.
"""

from __future__ import annotations

import argparse
import csv
import html
import re
import sys
import unicodedata
import zipfile
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
NS_REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"

ALIAS = {
    "fecha": "fecha",
    "proveedor": "proveedor",
    "producto": "producto", "concepto": "producto", "articulo": "producto", "descripcion": "producto",
    "categoria": "categoria", "familia": "categoria",
    "cantidad": "cantidad", "uds": "cantidad", "unidades": "cantidad",
    "precio unitario": "precio", "precio": "precio", "p unitario": "precio",
    "total": "total", "importe": "total",
}
OBLIGATORIAS = {"fecha", "proveedor", "producto"}
UMBRAL_SUBIDA = 0.05  # avisa de subidas de precio de más del 5 %

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


@dataclass
class Linea:
    fecha: date
    proveedor: str
    producto: str
    categoria: str
    cantidad: float | None
    precio: float | None
    total: float


# ---------------------------------------------------------------- lectura

def normalizar(texto: str) -> str:
    """'Categoría ' -> 'categoria', 'P. Unitario' -> 'p unitario'."""
    texto = unicodedata.normalize("NFD", str(texto)).encode("ascii", "ignore").decode()
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", texto.lower()).split())


def col_a_indice(ref: str) -> int:
    letras = re.match(r"[A-Z]+", ref).group()
    n = 0
    for c in letras:
        n = n * 26 + (ord(c) - 64)
    return n - 1


def leer_xlsx(ruta: Path) -> list[list]:
    """Devuelve la primera hoja como lista de filas (lista de valores)."""
    with zipfile.ZipFile(ruta) as z:
        nombres = set(z.namelist())
        compartidas: list[str] = []
        if "xl/sharedStrings.xml" in nombres:
            raiz = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in raiz.findall("m:si", NS):
                compartidas.append("".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")))

        # Primera hoja según workbook.xml y sus relaciones
        libro = ET.fromstring(z.read("xl/workbook.xml"))
        primera = libro.find("m:sheets/m:sheet", NS)
        destino = "worksheets/sheet1.xml"
        if primera is not None and "xl/_rels/workbook.xml.rels" in nombres:
            rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
            for rel in rels:
                if rel.get("Id") == primera.get(NS_REL):
                    destino = rel.get("Target").lstrip("/").removeprefix("xl/")
        hoja = ET.fromstring(z.read(f"xl/{destino}"))

    filas = []
    for row in hoja.iter(f"{{{NS['m']}}}row"):
        valores: dict[int, object] = {}
        for c in row.findall("m:c", NS):
            tipo = c.get("t")
            v = c.find("m:v", NS)
            if tipo == "s" and v is not None:
                valor = compartidas[int(v.text)]
            elif tipo == "inlineStr":
                valor = "".join(t.text or "" for t in c.iter(f"{{{NS['m']}}}t"))
            elif tipo in ("str", "e") and v is not None:
                valor = v.text
            elif tipo == "b" and v is not None:
                valor = v.text == "1"
            elif v is not None and v.text is not None:
                valor = float(v.text)
            else:
                continue
            valores[col_a_indice(c.get("r"))] = valor
        if valores:
            filas.append([valores.get(i) for i in range(max(valores) + 1)])
    return filas


def leer_csv(ruta: Path) -> list[list]:
    texto = ruta.read_bytes()
    for codificacion in ("utf-8-sig", "cp1252", "latin-1"):
        try:
            contenido = texto.decode(codificacion)
            break
        except UnicodeDecodeError:
            continue
    separador = ";" if contenido.count(";") > contenido.count(",") else ","
    return [fila for fila in csv.reader(contenido.splitlines(), delimiter=separador) if any(fila)]


def a_fecha(valor) -> date | None:
    if isinstance(valor, (int, float)):
        return date(1899, 12, 30) + timedelta(days=int(valor))
    if isinstance(valor, str):
        valor = valor.strip()
        for formato in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d/%m/%y"):
            try:
                return datetime.strptime(valor, formato).date()
            except ValueError:
                pass
    return None


def a_numero(valor) -> float | None:
    if valor is None or valor == "":
        return None
    if isinstance(valor, (int, float)):
        return float(valor)
    texto = str(valor).replace("€", "").replace(" ", "").strip()
    if "," in texto and "." in texto:      # 1.234,56
        texto = texto.replace(".", "").replace(",", ".")
    elif "," in texto:                      # 12,50
        texto = texto.replace(",", ".")
    try:
        return float(texto)
    except ValueError:
        return None


def cargar(carpeta: Path) -> tuple[list[Linea], list[str]]:
    lineas: list[Linea] = []
    avisos: list[str] = []
    archivos = sorted([*carpeta.glob("*.xlsx"), *carpeta.glob("*.csv")])
    archivos = [a for a in archivos if not a.name.startswith("~$")]  # temporales de Excel
    if not archivos:
        avisos.append(f"No hay archivos .xlsx ni .csv en {carpeta}")
    for ruta in archivos:
        try:
            filas = leer_xlsx(ruta) if ruta.suffix.lower() == ".xlsx" else leer_csv(ruta)
        except (zipfile.BadZipFile, KeyError, ET.ParseError) as e:
            avisos.append(f"{ruta.name}: no se pudo leer ({e.__class__.__name__}). ¿Está dañado o abierto en Excel?")
            continue
        if not filas:
            avisos.append(f"{ruta.name}: está vacío")
            continue

        cabecera = {}
        for i, nombre in enumerate(filas[0]):
            clave = ALIAS.get(normalizar(nombre or ""))
            if clave and clave not in cabecera:
                cabecera[clave] = i
        faltan = OBLIGATORIAS - cabecera.keys()
        if faltan or ("total" not in cabecera and not {"cantidad", "precio"} <= cabecera.keys()):
            avisos.append(f"{ruta.name}: faltan columnas ({', '.join(sorted(faltan)) or 'Total o Cantidad y Precio'})")
            continue

        def campo(fila, clave):
            i = cabecera.get(clave)
            return fila[i] if i is not None and i < len(fila) else None

        for n, fila in enumerate(filas[1:], start=2):
            fecha = a_fecha(campo(fila, "fecha"))
            cantidad = a_numero(campo(fila, "cantidad"))
            precio = a_numero(campo(fila, "precio"))
            total = a_numero(campo(fila, "total"))
            if total is None and cantidad is not None and precio is not None:
                total = round(cantidad * precio, 2)
            if fecha is None or total is None or not campo(fila, "producto"):
                avisos.append(f"{ruta.name}, fila {n}: descartada (fecha, producto o importe no válidos)")
                continue
            lineas.append(Linea(
                fecha=fecha,
                proveedor=str(campo(fila, "proveedor") or "Sin proveedor").strip(),
                producto=str(campo(fila, "producto")).strip(),
                categoria=str(campo(fila, "categoria") or "Sin categoría").strip(),
                cantidad=cantidad, precio=precio, total=total,
            ))
    return lineas, avisos


# ---------------------------------------------------------------- cálculo

def mes_de(d: date) -> str:
    return f"{d.year}-{d.month:02d}"


def mes_anterior(mes: str) -> str:
    anio, m = map(int, mes.split("-"))
    return f"{anio - (m == 1)}-{(m - 2) % 12 + 1:02d}"


def nombre_mes(mes: str) -> str:
    anio, m = map(int, mes.split("-"))
    return f"{MESES[m - 1]} de {anio}"


def agrupar(lineas: list[Linea], campo: str) -> list[tuple[str, float]]:
    sumas: dict[str, float] = defaultdict(float)
    for l in lineas:
        sumas[getattr(l, campo)] += l.total
    return sorted(sumas.items(), key=lambda x: -x[1])


def precio_medio(lineas: list[Linea]) -> dict[str, float]:
    """Precio medio ponderado por cantidad, por producto."""
    importe: dict[str, float] = defaultdict(float)
    cantidad: dict[str, float] = defaultdict(float)
    for l in lineas:
        if l.cantidad and l.precio is not None:
            importe[l.producto] += l.precio * l.cantidad
            cantidad[l.producto] += l.cantidad
    return {p: importe[p] / cantidad[p] for p in importe if cantidad[p]}


def resumir(lineas: list[Linea], mes: str) -> dict:
    actual = [l for l in lineas if mes_de(l.fecha) == mes]
    previo_mes = mes_anterior(mes)
    previo = [l for l in lineas if mes_de(l.fecha) == previo_mes]

    pm_actual, pm_previo = precio_medio(actual), precio_medio(previo)
    subidas = []
    for producto, precio in pm_actual.items():
        antes = pm_previo.get(producto)
        if antes and (precio - antes) / antes > UMBRAL_SUBIDA:
            subidas.append((producto, antes, precio, (precio - antes) / antes))
    subidas.sort(key=lambda x: -x[3])

    total = sum(l.total for l in actual)
    total_previo = sum(l.total for l in previo)
    return {
        "mes": mes,
        "lineas": len(actual),
        "total": total,
        "total_previo": total_previo if previo else None,
        "proveedores": agrupar(actual, "proveedor"),
        "categorias": agrupar(actual, "categoria"),
        "productos": agrupar(actual, "producto")[:10],
        "subidas": subidas,
        "mes_previo": previo_mes,
    }


# ---------------------------------------------------------------- salida

def euros(x: float) -> str:
    entero, decimal = f"{x:,.2f}".split(".")
    return f"{entero.replace(',', '.')},{decimal} €"


def porcentaje(x: float) -> str:
    return f"{x * 100:+.1f} %".replace(".", ",")


def tabla_barras(filas: list[tuple[str, float]], total: float) -> str:
    maximo = max((v for _, v in filas), default=1) or 1
    cuerpo = []
    for nombre, valor in filas:
        ancho = valor / maximo * 100
        cuota = valor / total * 100 if total else 0
        cuerpo.append(
            f'<tr><th scope="row">{html.escape(nombre)}</th>'
            f'<td class="barra"><span style="width:{ancho:.1f}%"></span></td>'
            f'<td class="num">{euros(valor)}</td><td class="num tenue">{f"{cuota:.1f}".replace(".", ",")} %</td></tr>'
        )
    return "<table><tbody>" + "".join(cuerpo) + "</tbody></table>"


def generar_html(r: dict, avisos: list[str]) -> str:
    variacion = ""
    if r["total_previo"]:
        cambio = (r["total"] - r["total_previo"]) / r["total_previo"]
        sentido = "más" if cambio > 0 else "menos"
        variacion = (f'<p class="variacion">{porcentaje(cambio)} que en {nombre_mes(r["mes_previo"])} '
                     f'({euros(abs(r["total"] - r["total_previo"]))} {sentido})</p>')

    if r["subidas"]:
        filas = "".join(
            f'<tr><th scope="row">{html.escape(p)}</th><td class="num">{euros(a)}</td>'
            f'<td class="num">{euros(b)}</td><td class="num sube">{porcentaje(c)}</td></tr>'
            for p, a, b, c in r["subidas"])
        subidas = (f'<table><thead><tr><th>Producto</th><th class="num">Antes</th><th class="num">Ahora</th>'
                   f'<th class="num">Cambio</th></tr></thead><tbody>{filas}</tbody></table>')
    else:
        subidas = '<p class="tenue">Ningún producto ha subido más de un 5 % respecto al mes anterior.</p>'

    bloque_avisos = ""
    if avisos:
        items = "".join(f"<li>{html.escape(a)}</li>" for a in avisos)
        bloque_avisos = f'<section><h2>Avisos de la lectura</h2><ul class="avisos">{items}</ul></section>'

    generado = datetime.now().strftime("%d/%m/%Y %H:%M")
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gastos de {nombre_mes(r["mes"])}</title>
<style>
  :root {{ --tinta:#1d2b2a; --suave:#5f6f6c; --linea:#d9e0de; --fondo:#f7f9f8; --barra:#2e6b5c; --alerta:#a4461f; }}
  * {{ box-sizing:border-box }}
  body {{ margin:0; background:var(--fondo); color:var(--tinta); font:15px/1.5 system-ui, "Segoe UI", sans-serif }}
  main {{ max-width:860px; margin:0 auto; padding-block:40px 64px; padding-inline:20px }}
  h1 {{ font-size:1.9rem; line-height:1.15; margin:0 0 4px }}
  h2 {{ font-size:1.1rem; margin:0 0 12px }}
  .total {{ font-size:2.6rem; font-weight:700; font-variant-numeric:tabular-nums; margin:20px 0 0 }}
  .variacion, .tenue {{ color:var(--suave) }}
  section {{ margin-top:36px }}
  table {{ width:100%; border-collapse:collapse; font-variant-numeric:tabular-nums }}
  th, td {{ text-align:left; padding:8px 6px; border-bottom:1px solid var(--linea); vertical-align:middle }}
  thead th {{ font-size:.85rem; color:var(--suave); font-weight:600 }}
  tbody th {{ font-weight:500 }}
  .num {{ text-align:right; white-space:nowrap }}
  .barra {{ width:40%; min-width:80px }}
  .barra span {{ display:block; height:10px; background:var(--barra); border-radius:2px }}
  .sube {{ color:var(--alerta); font-weight:600 }}
  .avisos {{ color:var(--suave); padding-left:18px }}
  .scroll {{ overflow-x:auto }}
  footer {{ margin-top:48px; font-size:.85rem; color:var(--suave) }}
  @media (max-width:560px) {{ .barra {{ display:none }} .total {{ font-size:2rem }} }}
</style>
</head>
<body>
<main>
  <h1>Gastos de {nombre_mes(r["mes"])}</h1>
  <p class="tenue">{r["lineas"]} líneas de factura · {len(r["proveedores"])} proveedores</p>
  <p class="total">{euros(r["total"])}</p>
  {variacion}

  <section><h2>Por proveedor</h2><div class="scroll">{tabla_barras(r["proveedores"], r["total"])}</div></section>
  <section><h2>Por categoría</h2><div class="scroll">{tabla_barras(r["categorias"], r["total"])}</div></section>
  <section><h2>Los 10 productos con más gasto</h2><div class="scroll">{tabla_barras(r["productos"], r["total"])}</div></section>
  <section><h2>Subidas de precio frente a {nombre_mes(r["mes_previo"])}</h2><div class="scroll">{subidas}</div></section>
  {bloque_avisos}

  <footer>Generado el {generado} con resumen_gastos.py</footer>
</main>
</body>
</html>
"""


def generar_csv(r: dict, ruta: Path) -> None:
    with ruta.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")  # ; para que Excel en español lo abra en columnas
        w.writerow(["Tipo", "Nombre", "Importe (€)"])
        for tipo, clave in (("Proveedor", "proveedores"), ("Categoría", "categorias"), ("Producto", "productos")):
            for nombre, valor in r[clave]:
                w.writerow([tipo, nombre, f"{valor:.2f}".replace(".", ",")])
        w.writerow(["Total", nombre_mes(r["mes"]), f"{r['total']:.2f}".replace(".", ",")])


# ---------------------------------------------------------------- programa

def main() -> int:
    base = Path(__file__).parent
    p = argparse.ArgumentParser(description="Resumen mensual de gastos de proveedores (Excel o CSV).")
    p.add_argument("--entrada", type=Path, default=base / "entrada", help="carpeta con los .xlsx o .csv")
    p.add_argument("--salida", type=Path, default=base / "salida", help="carpeta donde se guarda el informe")
    p.add_argument("--mes", help="mes a resumir, formato AAAA-MM (por defecto, el último con datos)")
    args = p.parse_args()

    if not args.entrada.is_dir():
        print(f"No existe la carpeta de entrada: {args.entrada}")
        return 1

    lineas, avisos = cargar(args.entrada)
    if not lineas:
        print("No se ha podido leer ninguna línea de factura.")
        for a in avisos:
            print(" -", a)
        return 1

    mes = args.mes or max(mes_de(l.fecha) for l in lineas)
    if not re.fullmatch(r"\d{4}-\d{2}", mes):
        print("El mes tiene que ir como AAAA-MM, por ejemplo 2026-09")
        return 1
    r = resumir(lineas, mes)
    if not r["lineas"]:
        meses = sorted({mes_de(l.fecha) for l in lineas})
        print(f"No hay datos de {mes}. Meses disponibles: {', '.join(meses)}")
        return 1

    args.salida.mkdir(parents=True, exist_ok=True)
    ruta_html = args.salida / f"resumen_{mes}.html"
    ruta_csv = args.salida / f"resumen_{mes}.csv"
    ruta_html.write_text(generar_html(r, avisos), encoding="utf-8")
    generar_csv(r, ruta_csv)

    print(f"Gastos de {nombre_mes(mes)}: {euros(r['total'])} en {r['lineas']} líneas")
    if r["total_previo"]:
        print(f"  {porcentaje((r['total'] - r['total_previo']) / r['total_previo'])} frente a {nombre_mes(r['mes_previo'])}")
    print(f"  Proveedor con más gasto: {r['proveedores'][0][0]} ({euros(r['proveedores'][0][1])})")
    if r["subidas"]:
        p0 = r["subidas"][0]
        print(f"  Mayor subida de precio: {p0[0]} ({porcentaje(p0[3])})")
    if avisos:
        print(f"  {len(avisos)} aviso(s) de lectura: revisa el informe")
    print(f"Informe: {ruta_html}")
    print(f"CSV:     {ruta_csv}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
