"""
Genera archivos .xlsx de ejemplo (facturas de proveedores de un restaurante)
para probar resumen_gastos.py.

Solo usa la librería estándar de Python: un .xlsx es un .zip con XML dentro,
así que se puede escribir a mano sin openpyxl.

Uso:
    python generar_datos_ejemplo.py
"""

import random
import zipfile
from datetime import date, timedelta
from pathlib import Path
from xml.sax.saxutils import escape

CARPETA = Path(__file__).parent / "entrada"

# Un .xlsx es un .zip, y un .zip guarda la fecha de cada archivo que mete.
# Con una fecha fija, volver a generar los ejemplos produce archivos idénticos
# byte a byte y no aparecen como cambios en el control de versiones.
FECHA_ZIP = (2026, 1, 1, 0, 0, 0)

# (proveedor, [(producto, categoría, unidad, precio_min, precio_max, cantidad_min, cantidad_max)])
PROVEEDORES = {
    "Cárnicas del Nalón": [
        ("Ternera asturiana (kg)", "Carne", 14.5, 16.9, 8, 20),
        ("Lacón (kg)", "Carne", 7.2, 8.4, 3, 8),
        ("Chorizo asturiano (kg)", "Carne", 9.8, 11.2, 2, 6),
        ("Pollo de corral (kg)", "Carne", 5.4, 6.3, 6, 15),
    ],
    "Pescados Cimadevilla": [
        ("Pixín (kg)", "Pescado", 19.0, 24.0, 2, 6),
        ("Merluza del pincho (kg)", "Pescado", 13.5, 17.0, 3, 8),
        ("Bonito del norte (kg)", "Pescado", 11.0, 14.5, 2, 7),
    ],
    "Frutas y Verduras La Vega": [
        ("Patata (kg)", "Verdura", 0.85, 1.2, 25, 60),
        ("Cebolla (kg)", "Verdura", 0.9, 1.3, 10, 25),
        ("Pimiento (kg)", "Verdura", 2.1, 3.0, 4, 10),
        ("Manzana de sidra (kg)", "Fruta", 1.4, 2.0, 5, 15),
        ("Lechuga (ud)", "Verdura", 0.7, 1.1, 15, 40),
    ],
    "Lácteos Peñamayor": [
        ("Leche entera (l)", "Lácteos", 0.95, 1.15, 20, 50),
        ("Queso de Afuega'l Pitu (ud)", "Lácteos", 7.5, 9.0, 3, 8),
        ("Nata para cocinar (l)", "Lácteos", 3.2, 3.9, 4, 10),
        ("Mantequilla (kg)", "Lácteos", 8.5, 9.9, 1, 4),
    ],
    "Bebidas Llagar del Centro": [
        ("Sidra natural (caja 12 bot.)", "Bebida", 22.0, 26.0, 4, 12),
        ("Agua mineral (caja 24)", "Bebida", 5.5, 6.8, 3, 8),
        ("Vino de la casa (caja 6)", "Bebida", 18.0, 24.0, 1, 4),
    ],
}

COLUMNAS = ["Fecha", "Proveedor", "Producto", "Categoría", "Cantidad", "Precio unitario", "Total"]


def fecha_a_serial_excel(d: date) -> int:
    """Excel cuenta los días desde el 30/12/1899."""
    return (d - date(1899, 12, 30)).days


def celda(ref: str, valor, estilo: int = 0) -> str:
    s = f' s="{estilo}"' if estilo else ""
    if isinstance(valor, (int, float)):
        return f'<c r="{ref}"{s}><v>{valor}</v></c>'
    return f'<c r="{ref}" t="inlineStr"{s}><is><t>{escape(str(valor))}</t></is></c>'


def letra_columna(i: int) -> str:
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i]


def escribir_xlsx(ruta: Path, filas: list[list]) -> None:
    hoja = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>']
    for n, fila in enumerate(filas, start=1):
        celdas = []
        for i, valor in enumerate(fila):
            estilo = 1 if (n > 1 and i == 0) else (2 if (n > 1 and i >= 5) else 0)
            celdas.append(celda(f"{letra_columna(i)}{n}", valor, estilo))
        hoja.append(f'<row r="{n}">{"".join(celdas)}</row>')
    hoja.append("</sheetData></worksheet>")

    archivos = {
        "[Content_Types].xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            "</Types>"
        ),
        "_rels/.rels": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            "</Relationships>"
        ),
        "xl/workbook.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="Facturas" sheetId="1" r:id="rId1"/></sheets></workbook>'
        ),
        "xl/_rels/workbook.xml.rels": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            "</Relationships>"
        ),
        # Estilo 1 = fecha dd/mm/aaaa · estilo 2 = número con 2 decimales
        "xl/styles.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts>'
            '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
            '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
            '<borders count="1"><border/></borders>'
            '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            '<cellXfs count="3">'
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            '<xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            "</cellXfs></styleSheet>"
        ),
        "xl/worksheets/sheet1.xml": "".join(hoja),
    }
    with zipfile.ZipFile(ruta, "w", zipfile.ZIP_DEFLATED) as z:
        for nombre, contenido in archivos.items():
            entrada = zipfile.ZipInfo(nombre, date_time=FECHA_ZIP)
            entrada.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(entrada, contenido)


def generar_mes(anio: int, mes: int, rng: random.Random) -> dict[str, list[list]]:
    inicio = date(anio, mes, 1)
    fin = date(anio + (mes == 12), mes % 12 + 1, 1)
    por_proveedor: dict[str, list[list]] = {}
    for proveedor, productos in PROVEEDORES.items():
        filas = []
        d = inicio
        # Cada proveedor sirve 2 veces por semana aprox.
        while d < fin:
            if d.weekday() in (0, 3) or (proveedor.startswith("Frutas") and d.weekday() == 5):
                for nombre, cat, pmin, pmax, cmin, cmax in rng.sample(productos, k=rng.randint(2, len(productos))):
                    precio = round(rng.uniform(pmin, pmax), 2)
                    cantidad = rng.randint(cmin, cmax)
                    filas.append([fecha_a_serial_excel(d), proveedor, nombre, cat, cantidad, precio, round(precio * cantidad, 2)])
            d += timedelta(days=1)
        por_proveedor[proveedor] = filas
    return por_proveedor


def main() -> None:
    CARPETA.mkdir(exist_ok=True)
    rng = random.Random(2026)
    for anio, mes in ((2026, 8), (2026, 9)):
        for proveedor, filas in generar_mes(anio, mes, rng).items():
            slug = proveedor.lower().replace(" ", "-").replace("'", "")
            for a, b in (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ñ", "n")):
                slug = slug.replace(a, b)
            ruta = CARPETA / f"{anio}-{mes:02d}_{slug}.xlsx"
            escribir_xlsx(ruta, [COLUMNAS] + filas)
            print(f"Creado {ruta.name} ({len(filas)} líneas)")


if __name__ == "__main__":
    main()
