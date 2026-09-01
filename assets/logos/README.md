# Logos de partners

No incluyo aquí los logotipos reales de HPE ni de Zerto (son marcas
registradas de sus respectivas compañías) — solo dejo preparado el
hueco en el HTML/CSS para que coloques tus ficheros oficiales.

## Qué archivos añadir

Coloca aquí exactamente estos dos ficheros (el nombre importa, el HTML
ya los referencia así):

```
assets/logos/hpe-logo.svg      (o .png)
assets/logos/zerto-logo.svg    (o .png)
```

Si usas `.png` en vez de `.svg`, actualiza la extensión en:
- `login.html` (dos `<img>` en el bloque `.brand-row`)
- `index.html` (mismo bloque en el `sidebar__header`)

## Recomendación de tamaño

- Altura recomendada: 28-32px (el CSS ya limita `max-height` para que
  encajen junto al logo de la app sin desbordar)
- Fondo transparente (SVG o PNG con alpha) para que se vea bien tanto
  en el header claro como en cualquier fondo

## Comportamiento sin los ficheros

Mientras no añadas estos ficheros, los `<img>` tienen un `onerror` que
los oculta automáticamente — no verás iconos rotos, simplemente no
aparecerá nada hasta que coloques los logos reales.
