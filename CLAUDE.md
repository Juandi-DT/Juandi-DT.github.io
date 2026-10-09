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
textos.js                         ← todos los textos de la página principal,
                                    en español y en inglés. El HTML no lleva
                                    texto suelto: cada elemento tiene
                                    data-t="clave" y main.js lo rellena
favicon.svg
proyectos/
  web-sidreria/                   ← web de una sidrería ficticia: carta
                                    ilustrada por pestañas, horario con
                                    "abierto ahora" y reservas por WhatsApp.
                                    Los dibujos de los platos son símbolos SVG
                                    dentro de su index.html
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
- Las animaciones van suaves y cortas, y **todas** se desactivan dentro de
  `@media (prefers-reduced-motion: reduce)`. Nada que parpadee ni se mueva
  solo de forma continua.
- Las ilustraciones son SVG propios. **No se descargan fotos de internet**:
  o son del cliente, o son dibujos nuestros.

### Herramientas instaladas en este equipo

- Git 2.55 y Python 3.13, instalados con `winget` en esta sesión.
- No hay Node. Para probar las páginas en el navegador no hace falta: vale
  `python -m http.server 8123` desde la raíz del repositorio.

### Qué se puede inventar y qué no

La frontera no es "inventado o no", es **qué se afirma de mí**.

**Sí, y cuanto más concreto mejor:**

- Los datos de las demos: platos, precios, proveedores, recetas, facturas.
  Que parezcan de un negocio de verdad, no "Producto 1, 9,99 €". Una fabada a
  14,50 € y un proveedor llamado Cárnicas del Nalón venden la demo; "Plato de
  ejemplo" no vende nada.
- Los casos de la sección de soporte, escritos como **escenarios técnicos**:
  qué síntoma tiene el equipo, qué lo causa normalmente y cómo se arregla.
  Concretos, con marcas, tiempos y cifras cuando ayuden a entenderlo.
- Supuestos de trabajo: "si tienes cuatro proveedores y cada mes juntas sus
  Excel a mano, eso son dos horas que te ahorras".

**No, porque me deja vendido:**

- **Testimonios y reseñas de clientes.** No hay clientes todavía.
- **Trabajos concretos atribuidos a mí**: "le hice la web a la sidrería tal",
  "monté la red de la gestoría tal". Si un cliente pregunta por ello en una
  llamada y no sé responder, pierdo ese trabajo y el siguiente.
- **Cifras de trayectoria**: "+20 proyectos", "3 años de experiencia",
  "50 clientes". Fiverr y Upwork cierran cuentas por esto, y arrancar un
  perfil nuevo cuesta demasiado como para arriesgarlo.
- Logos de empresas y sellos de certificaciones que no tengo.

**La forma de decirlo.** Es la misma información, cambiando el sujeto:
no "le arreglé el portátil a un cliente", sino "un portátil que tarda tres
minutos en arrancar casi siempre es el disco mecánico: se clona a un SSD y
arranca en quince segundos". Lo segundo demuestra lo mismo, vende igual y es
verdad. Escríbelo siempre así.

**Lo que es verdad y conviene repetir:** conozco la hostelería desde dentro,
trabajo con IA y por eso entrego rápido, doy precio cerrado antes de empezar,
y el código queda explicado para que el cliente no dependa de mí.

- **Todo lo que sea demo se marca como demo**, visible en la propia página.
  La sidrería La Tonada es ficticia y lo dice arriba; los precios, la
  dirección y el teléfono son inventados y lo dice también. Los dibujos de los
  platos son ilustraciones, y lo dice.
- Me presento como **"desarrollador que trabaja con IA"**.
- Si tengo un caso real tuyo, **siempre gana al escenario inventado**:
  pregúntame si lo tienes antes de escribir uno genérico.

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

- **A.** ~~Versión en inglés del portafolio, con selector ES/EN.~~ Hecho.
- **B.** ~~Sección de soporte informático.~~ Hecha, con cuatro averías
  escritas como escenarios técnicos (síntoma, causa, solución): disco
  mecánico, impresora de comandas, correo en spam y copias de seguridad.
  Si Juan Diego cuenta casos suyos de verdad, sustituyen a estos.
- **C.** Textos de servicios para Fiverr, Malt, Workana y Upwork, en español e
  inglés, con precios investigados y la fuente de cada cifra.
- **D.** Cuando yo tenga las cuentas creadas, rellenar los perfiles con el
  navegador y dejarlos listos para que yo diga "publica".
