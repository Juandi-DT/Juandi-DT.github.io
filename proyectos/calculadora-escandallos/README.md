# Calculadora de escandallos

Herramienta web para calcular lo que cuesta de verdad cada ración de un plato y a qué precio hay que venderlo.

En hostelería se llama **escandallo** a la ficha de costes de un plato. Muchos bares la hacen a ojo, y por eso hay platos que se venden por debajo de su coste sin que nadie se dé cuenta.

## Qué hace

- Calcula el **coste por ración** a partir de los ingredientes, con su **merma**: si a un pescado se le va el 40 % entre espinas y piel, la calculadora compra de más para compensarlo.
- Propone el **precio de venta** (con y sin IVA) según el *food cost* que quieras: el porcentaje del precio que se lleva la materia prima, normalmente entre el 25 % y el 35 %.
- **"¿Y si lo vendes a…?"**: escribes el precio que tienes en carta y te dice tu food cost real y si estás por encima del objetivo.
- **Guarda recetas** en el navegador para abrirlas, duplicarlas o borrarlas.
- **Descarga la ficha en CSV** (se abre en Excel) o la **imprime** limpia, sin botones.
- Funciona en el móvil: en pantallas estrechas la tabla pasa a fichas.

## Fórmulas

```
cantidad a comprar = cantidad en el plato / (1 − merma)
coste ingrediente  = cantidad a comprar × precio de compra
coste por ración   = coste total / raciones
PVP sin IVA        = coste por ración / food cost objetivo
PVP con IVA        = PVP sin IVA × (1 + IVA)
```

## Técnica

HTML, CSS y JavaScript sin librerías. Las recetas se guardan en `localStorage`, solo en el navegador de quien la usa: no hay servidor ni cuentas. La receta de ejemplo (cachopo) lleva precios orientativos inventados.
