// SimuPIC — placas de los trabajos prácticos (las define el/la docente).
//
// Armá una placa en la herramienta de autoría (authoring.html), tocá "Export JSON",
// y pegá el JSON exportado en el arreglo de abajo. Cada entrada aparece en el
// menú "elegí una placa", donde los estudiantes la seleccionan y cargan su
// propio .hex compilado.
//
// Dos formas válidas por entrada:
//   1) una exportación de la herramienta:  { "name": "TP 1 — ...", "components": [ ... ] }
//   2) una placa completa con .hex de ejemplo y reloj:
//        { name:"...", diagram:{ name, components:[...] },
//          hex:":10...\n:00000001FF\n", clock:"4 MHz" }
window.NP_LABS = [
  { "name": "TP - Simple", "components": [
    { "type": "sevenseg", "pins": ["RB1","RB2","RB3","RB4","RB5","RB6","RB7"], "common": "", "commonActiveLow": false, "label": "Dígito" },
    { "type": "button", "pin": "RB0", "activeLow": true, "label": "Pulsador" }
  ] },
  {
  "name": "TP - Dificil",
  "components": [
    {
      "type": "sevenseg",
      "pins": [
        "RB1",
        "RB2",
        "RB3",
        "RB4",
        "RB5",
        "RB6",
        "RB7"
      ],
      "common": "RA0",
      "commonActiveLow": false,
      "label": "D1"
    },
    {
      "type": "sevenseg",
      "pins": [
        "RB1",
        "RB2",
        "RB3",
        "RB4",
        "RB5",
        "RB6",
        "RB7"
      ],
      "common": "RA1",
      "commonActiveLow": false,
      "label": "D2"
    },
    {
      "type": "sevenseg",
      "pins": [
        "RB1",
        "RB2",
        "RB3",
        "RB4",
        "RB5",
        "RB6",
        "RB7"
      ],
      "common": "RA2",
      "commonActiveLow": false,
      "label": "D3"
    },
    {
      "type": "sevenseg",
      "pins": [
        "RB1",
        "RB2",
        "RB3",
        "RB4",
        "RB5",
        "RB6",
        "RB7"
      ],
      "common": "RA3",
      "commonActiveLow": false,
      "label": "D4"
    },
    {
      "type": "button",
      "pin": "RA4",
      "activeLow": false,
      "label": "START"
    },
    {
      "type": "button",
      "pin": "RB0",
      "activeLow": false,
      "label": "STOP/STEP"
    }
  ]
}

  // Pegá más placas exportadas acá, por ejemplo:
  // { "name": "TP 1 — LED en RB0", "components": [ { "type": "led", "pin": "RB0", "label": "L1" } ] },
];
