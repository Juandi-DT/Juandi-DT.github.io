# Resumen mensual de gastos de proveedores

Script en Python que junta las facturas de varios proveedores (en Excel o CSV) y genera un informe del mes: cuánto se ha gastado, con quién, en qué, y qué productos han subido de precio.

Es el tipo de tarea que en un restaurante o una tienda pequeña se hace a mano cada mes copiando y pegando de varios Excel. Con el script son unos segundos.

**Ejemplo de resultado:** [`salida/resumen_2026-09.html`](salida/resumen_2026-09.html)

## Qué hace

- Lee todos los `.xlsx` y `.csv` de la carpeta `entrada/`.
- Reconoce las columnas aunque cambien de nombre u orden: `Fecha`, `Proveedor`, `Producto` (o `Concepto`, `Artículo`), `Categoría` (o `Familia`), `Cantidad`, `Precio unitario`, `Total` (o `Importe`). Si falta el total, lo calcula.
- Entiende fechas de Excel y fechas escritas (`05/09/2026`, `2026-09-05`), e importes con coma decimal (`12,50`).
- Genera en `salida/`:
  - un **informe HTML** con el gasto por proveedor, por categoría, los 10 productos con más gasto y las **subidas de precio de más del 5 %** frente al mes anterior;
  - un **CSV** con los totales, separado por `;` para que Excel en español lo abra en columnas.
- Si una fila tiene la fecha o el importe mal, no se para: la descarta y lo apunta en el informe.

## Cómo usarlo

Necesitas Python 3.10 o superior. **No hace falta instalar nada más**: solo usa la librería estándar.

```
python resumen_gastos.py                    # último mes con datos
python resumen_gastos.py --mes 2026-08      # un mes concreto
python resumen_gastos.py --entrada facturas --salida informes
```

Para probarlo con datos de ejemplo (facturas inventadas de agosto y septiembre de 2026):

```
python generar_datos_ejemplo.py
python resumen_gastos.py
```

## Detalles técnicos

- Un `.xlsx` es un archivo `.zip` con XML dentro. El script lo abre con `zipfile` y lo lee con `xml.etree`, sin `pandas` ni `openpyxl`, así que funciona en cualquier ordenador con Python.
- Soporta textos compartidos (`sharedStrings.xml`), textos en línea, números y booleanos, y localiza la primera hoja a través de las relaciones del libro.
- `generar_datos_ejemplo.py` hace el camino inverso: escribe `.xlsx` válidos (con formato de fecha) a mano.

## Adaptarlo a un negocio

Lo habitual es cambiar:
- el umbral de aviso de subida de precio (`UMBRAL_SUBIDA`, ahora un 5 %);
- los nombres de columna que reconoce (`ALIAS`);
- el formato del informe (función `generar_html`).

Se puede programar para que se ejecute solo cada mes y envíe el informe por correo.

---

Los datos de ejemplo son inventados.
