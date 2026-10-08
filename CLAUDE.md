# CLAUDE.md

Instrucciones para trabajar en este repositorio. Léelo antes de tocar nada.

## Quién soy

Juan Diego Guio, 19 años, Oviedo (Asturias). Trabajo de ayudante de cocina en un
club de tenis y estudio 1º de DAM a distancia. **Soy experto en IA, no en
programación**: vendo servicios de programación apoyándome en IA.

Háblame en **español de España**, directo y sin adornos. Sin entusiasmo de
folleto, sin resumir lo que acabo de decir, sin ofrecer cinco opciones cuando
hay una buena.

## Qué es este repositorio

Mi portafolio y escaparate de servicios freelance. Publicado en
<https://juandi-dt.github.io> desde la raíz de la rama `main` con GitHub Pages
(hay un `.nojekyll`, así que se sirve tal cual, sin Jekyll).

```
index.html, styles.css, main.js   ← la página principal del portafolio
                                    (en main.js está el bloque CONFIG: nombre,
                                     correo, WhatsApp, usuario de GitHub)
proyectos/
  web-sidreria/                   ← web de una sidrería ficticia:
                                    carta por pestañas, horario con "abierto
                                    ahora" y reservas por WhatsApp
  calculadora-escandallos/        ← coste por ración con mermas y precio de
                                    venta recomendado; guarda en localStorage
                                    y exporta CSV
  automatizacion-gastos/          ← script Python que junta facturas de
                                    proveedores (.xlsx/.csv) y genera informe
                                    HTML + CSV del mes
    resumen_gastos.py             ← el script
    generar_datos_ejemplo.py      ← crea las facturas de ejemplo
    entrada/                      ← facturas de ejemplo
    salida/                       ← informes generados (sí van al repo: la web
                                    enlaza resumen_2026-09.html como demo)
servicios/                        ← textos para Fiverr, Malt, Workana, Upwork.
                                    NO se publica en la web (ver más abajo)
```

## Reglas fijas

### Técnicas

- Los **proyectos de demostración** van en **HTML, CSS y JavaScript sin
  librerías ni frameworks**. En **Python, solo la librería estándar**.
  Esto es parte del argumento de venta: funciona en cualquier sitio, sin
  instalar nada, sin build, sin dependencias que se rompan. No lo negocies.
- La **página principal del portafolio sí puede usar librerías** si aportan
  algo real. Hoy solo carga fuentes de Google Fonts.
- Sin paso de compilación en ningún sitio: lo que está en el repo es lo que se
  sirve.
- Cada proyecto tiene su configuración agrupada en un bloque al principio del
  JS (`CONFIG`, `NEGOCIO`, `CARTA`): si hay que adaptar algo a otro negocio, se
  toca ahí y en las variables CSS, no repartido por el archivo.
- Accesibilidad: foco visible, contraste suficiente, navegable con teclado,
  `aria-live` donde el contenido cambia solo. Ya está así; mantenlo.
- Comentarios y nombres de variables **en español**, como el resto del código.

### Honestidad

- **Todo lo que sea demo se marca como demo**, visible en la propia página.
  La sidrería La Tonada es ficticia y lo dice arriba; los precios, la dirección
  y el teléfono son inventados y lo dice también.
- **Nunca inventar clientes, experiencia, testimonios ni cifras.** Ni "+20
  proyectos", ni "clientes satisfechos", ni logos, ni años de experiencia.
- Me presento como **"desarrollador que trabaja con IA"**. Nada de prometer
  experiencia que no tengo. Lo que sí es verdad y se puede decir: conozco la
  hostelería desde dentro, entrego rápido, doy precio cerrado.
- Si para escribir algo hace falta un dato que no tengo (un caso real de
  soporte, un cliente, un plazo), **pregúntame**. No lo rellenes.

### Antes de hacer push

1. Abrir en el navegador las páginas tocadas y comprobar que **no hay errores
   en la consola** y que **no hay nada descuadrado en el móvil** (375 px de
   ancho como referencia).
2. Si se ha tocado el script de Python, **ejecutarlo con los datos de ejemplo**
   y ver que termina sin error:
   ```
   cd proyectos/automatizacion-gastos
   python generar_datos_ejemplo.py
   python resumen_gastos.py
   ```
3. Los enlaces entre páginas son relativos: comprobar que siguen funcionando
   tanto en local como publicado.

### Git

- **Mensajes de commit en español.** En imperativo y concretos: "Añade selector
  de idioma en la página principal", no "update".
- Un commit por paso terminado, no un commit gigante al final.
- `main` es la rama que se publica. Lo que se comitea en `main` y se sube, sale
  publicado en minutos.

### Límites: no actúes por tu cuenta

- **Nunca crear cuentas** en ninguna plataforma.
- **Nunca escribir contraseñas** ni datos de pago.
- **Nunca publicar un perfil, una oferta o un mensaje** en Fiverr, Malt,
  Workana, Upwork ni en ninguna otra parte, **hasta que yo diga "publica"**.
- **Nunca enviar correos ni mensajes** hasta que yo diga "envía".
- Rellenar formularios de perfil con el navegador, sí: dejarlos listos y
  pararse antes del botón de publicar.
- `git push` a `main` publica la web: avísame de lo que has probado antes de
  hacerlo.

## La carpeta `servicios/`

Textos de venta para las plataformas (título, descripción, paquetes y precios,
etiquetas, preguntas frecuentes), en español y en inglés. **No debe aparecer en
la web publicada.** Como GitHub Pages sirve toda la raíz y el repositorio es
público, los archivos serían accesibles por URL directa aunque nada los enlace:

- no se enlazan desde ninguna página del sitio;
- los archivos son `.md`, que GitHub Pages sirve como descarga, no como página;
- no hay índice de directorios, así que no se puede listar la carpeta.

Que no esté enlazado no lo hace secreto: no metas ahí nada que no pueda ver
quien adivine la URL (ni precios que no quiera mostrar, ni datos personales más
allá de lo que ya hay en la web).

## Pendiente

Ver el estado real en el historial de git y en `servicios/`. El plan acordado,
en este orden:

- **A.** Versión en inglés del portafolio, con selector ES/EN en la página
  principal, sin duplicar el código.
- **B.** Sección de soporte informático, con 2 o 3 casos **reales** míos
  (hay que preguntármelos).
- **C.** Textos de servicios para Fiverr, Malt, Workana y Upwork, en español e
  inglés, con precios investigados y la fuente de cada cifra.
- **D.** Cuando yo tenga las cuentas creadas, rellenar los perfiles con el
  navegador y dejarlos listos para que yo diga "publica".
