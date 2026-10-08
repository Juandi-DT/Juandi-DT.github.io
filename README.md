# Portafolio · Juan Diego Guio

Webs y automatizaciones para negocios locales.

| Proyecto | Qué es | Técnica |
|---|---|---|
| [Web para una sidrería](proyectos/web-sidreria/) | Carta, horario con "abierto ahora" y reservas por WhatsApp | HTML, CSS y JavaScript sin librerías |
| [Calculadora de escandallos](proyectos/calculadora-escandallos/) | Coste por ración con mermas y precio de venta recomendado | JavaScript sin librerías |
| [Resumen mensual de gastos](proyectos/automatizacion-gastos/) | Junta facturas de proveedores en Excel y genera un informe | Python, solo librería estándar |

## Estructura

```
portafolio/
├── index.html                 ← la página del portafolio
├── styles.css
├── main.js                    ← CONFIG: nombre, correo, WhatsApp y usuario de GitHub
└── proyectos/
    ├── web-sidreria/
    ├── calculadora-escandallos/
    └── automatizacion-gastos/
        ├── resumen_gastos.py
        ├── generar_datos_ejemplo.py
        ├── entrada/           ← facturas de ejemplo (.xlsx)
        └── salida/            ← informes generados (.html y .csv)
```

## Publicarlo gratis en GitHub Pages

1. Crea una cuenta en github.com. El nombre de usuario será tu dirección: `https://<usuario>.github.io`.
2. Crea un repositorio nuevo, **público**, llamado exactamente `<usuario>.github.io`.
3. En el repositorio: **Add file → Upload files**, y arrastra **todo el contenido** de esta carpeta (no la carpeta en sí: `index.html` tiene que quedar en la raíz). Pulsa **Commit changes**.
4. Ve a **Settings → Pages**. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guarda.
5. En uno o dos minutos la web está en `https://<usuario>.github.io`.

## Antes de publicar: edita `main.js`

Al principio del archivo está el bloque `CONFIG`:

- `github`: tu usuario. Activa los botones "Ver el código" de cada proyecto.
- `whatsapp`: tu número con prefijo (`346…`). Si lo dejas vacío, no se muestra.
- `email`: el correo de contacto. **Va a ser público**: si no quieres recibir spam en tu correo personal, crea uno solo para trabajo.

## Pendiente

- **Casos de soporte informático**: añadir 2 o 3 problemas reales que hayas resuelto (qué pasaba, qué hiciste, cómo quedó). Solo casos verdaderos.
- **Versión en inglés**: para Fiverr y Upwork, donde la mayoría de clientes escriben en inglés.
