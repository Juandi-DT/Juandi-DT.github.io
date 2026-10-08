# Web para una sidrería

Web de una página para un bar o restaurante: carta por secciones, horario, estado "abierto / cerrado" en tiempo real y reservas que llegan por WhatsApp.

**Proyecto de demostración.** La Tonada es un negocio ficticio; precios, dirección y teléfono son inventados.

## Qué resuelve

Lo que más pregunta un cliente antes de ir a un bar: qué tienen, cuánto cuesta, si está abierto y cómo reservar. La web responde a las cuatro cosas desde el móvil y sin llamar.

## Funciones

- **Abierto ahora / cerrado**: se calcula con la hora de Oviedo, aunque quien la mire esté en otro país, y tiene en cuenta los cierres pasada la medianoche.
- **Carta por pestañas**, accesible con teclado (flechas izquierda y derecha).
- **Horario** con el día de hoy resaltado.
- **Reservas**: solo ofrece las horas en que el local abre (hasta una hora antes del cierre, cada 30 minutos) y, si es hoy, con al menos una hora de margen. Al enviar, abre WhatsApp con la reserva ya escrita. El dueño no necesita ningún programa nuevo.
- Diseño adaptado al móvil, con contraste suficiente y foco visible al navegar con teclado.

## Cómo adaptarla a otro negocio

Todo lo que cambia de un local a otro está en el bloque `NEGOCIO` y en `CARTA`, al principio de `app.js`: nombre, número de WhatsApp, horario por días, platos y precios. Los colores están en las variables de `styles.css`.

## Técnica

HTML, CSS y JavaScript sin librerías ni frameworks. Sin servidor: se publica gratis en GitHub Pages, Netlify o cualquier hosting.
