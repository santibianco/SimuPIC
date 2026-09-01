/* SimuPIC — PIC16F628A instruction set (datasheet DS40044F, Table 15-2 + §15.2).
 *
 * One table, three consumers: the "Instrucciones" modal, the hover tooltips in the
 * code editor and in the debugger's Program view, and (potentially) asm.js.
 * Fields, in the order the datasheet lists them:
 *   m     mnemonic
 *   o     operands as written in source ("" for none)
 *   d     what it does, in Spanish (student-facing)
 *   op    the datasheet's Operation column, compacted
 *   c     cycles — "1", "2" or "1 (2)" when a skip is taken
 *   s     STATUS bits affected ("" for none)
 *   e     14-bit encoding, MSb→LSb
 *   n     datasheet notes that apply (see NOTES below)
 *   g     group: "b" byte-oriented · "t" bit-oriented · "l" literal and control
 * Cross-checked against the OPS table in asm.js by test-isa.js.
 */
(function (root) {
  const ISA = [
    // ---- byte-oriented file register operations -------------------------------
    { m:"ADDWF",  o:"f, d", d:"Suma W y f",                                    op:"(W) + (f) → destino",        c:"1",     s:"C, DC, Z", e:"00 0111 dfff ffff", n:[1,2],   g:"b" },
    { m:"ANDWF",  o:"f, d", d:"AND de W con f",                                op:"(W) AND (f) → destino",      c:"1",     s:"Z",        e:"00 0101 dfff ffff", n:[1,2],   g:"b" },
    { m:"CLRF",   o:"f",    d:"Pone f en 0",                                   op:"00h → (f), 1 → Z",           c:"1",     s:"Z",        e:"00 0001 1fff ffff", n:[2],     g:"b" },
    { m:"CLRW",   o:"",     d:"Pone W en 0",                                   op:"00h → (W), 1 → Z",           c:"1",     s:"Z",        e:"00 0001 0xxx xxxx", n:[],      g:"b" },
    { m:"COMF",   o:"f, d", d:"Complementa f: invierte todos sus bits",        op:"(f̄) → destino",              c:"1",     s:"Z",        e:"00 1001 dfff ffff", n:[1,2],   g:"b" },
    { m:"DECF",   o:"f, d", d:"Resta 1 a f",                                   op:"(f) − 1 → destino",          c:"1",     s:"Z",        e:"00 0011 dfff ffff", n:[1,2],   g:"b" },
    { m:"DECFSZ", o:"f, d", d:"Resta 1 a f y saltea la instrucción siguiente si queda en 0", op:"(f) − 1 → destino; skip si = 0", c:"1 (2)", s:"", e:"00 1011 dfff ffff", n:[1,2,3], g:"b" },
    { m:"INCF",   o:"f, d", d:"Suma 1 a f",                                    op:"(f) + 1 → destino",          c:"1",     s:"Z",        e:"00 1010 dfff ffff", n:[1,2],   g:"b" },
    { m:"INCFSZ", o:"f, d", d:"Suma 1 a f y saltea la instrucción siguiente si queda en 0",  op:"(f) + 1 → destino; skip si = 0", c:"1 (2)", s:"", e:"00 1111 dfff ffff", n:[1,2,3], g:"b" },
    { m:"IORWF",  o:"f, d", d:"OR de W con f",                                 op:"(W) OR (f) → destino",       c:"1",     s:"Z",        e:"00 0100 dfff ffff", n:[1,2],   g:"b" },
    { m:"MOVF",   o:"f, d", d:"Mueve f a W o sobre sí mismo; sirve para probar si vale 0",  op:"(f) → destino", c:"1",     s:"Z",        e:"00 1000 dfff ffff", n:[1,2],   g:"b" },
    { m:"MOVWF",  o:"f",    d:"Copia W en f",                                  op:"(W) → (f)",                  c:"1",     s:"",         e:"00 0000 1fff ffff", n:[],      g:"b" },
    { m:"NOP",    o:"",     d:"No hace nada; consume un ciclo",                op:"—",                          c:"1",     s:"",         e:"00 0000 0xx0 0000", n:[],      g:"b" },
    { m:"RLF",    o:"f, d", d:"Rota f un bit a la izquierda pasando por el Carry", op:"rotar izq. a través de C", c:"1",    s:"C",        e:"00 1101 dfff ffff", n:[1,2],   g:"b" },
    { m:"RRF",    o:"f, d", d:"Rota f un bit a la derecha pasando por el Carry",   op:"rotar der. a través de C", c:"1",    s:"C",        e:"00 1100 dfff ffff", n:[1,2],   g:"b" },
    { m:"SUBWF",  o:"f, d", d:"Resta W de f (f − W)",                          op:"(f) − (W) → destino",        c:"1",     s:"C, DC, Z", e:"00 0010 dfff ffff", n:[1,2],   g:"b" },
    { m:"SWAPF",  o:"f, d", d:"Intercambia los dos nibbles de f",              op:"(f<3:0>) ↔ (f<7:4>) → destino", c:"1",  s:"",         e:"00 1110 dfff ffff", n:[1,2],   g:"b" },
    { m:"XORWF",  o:"f, d", d:"XOR de W con f",                                op:"(W) XOR (f) → destino",      c:"1",     s:"Z",        e:"00 0110 dfff ffff", n:[1,2],   g:"b" },
    // ---- bit-oriented file register operations --------------------------------
    { m:"BCF",    o:"f, b", d:"Pone en 0 el bit b de f",                       op:"0 → (f<b>)",                 c:"1",     s:"",         e:"01 00bb bfff ffff", n:[1,2],   g:"t" },
    { m:"BSF",    o:"f, b", d:"Pone en 1 el bit b de f",                       op:"1 → (f<b>)",                 c:"1",     s:"",         e:"01 01bb bfff ffff", n:[1,2],   g:"t" },
    { m:"BTFSC",  o:"f, b", d:"Saltea la instrucción siguiente si el bit b de f es 0", op:"skip si (f<b>) = 0",  c:"1 (2)", s:"",         e:"01 10bb bfff ffff", n:[3],     g:"t" },
    { m:"BTFSS",  o:"f, b", d:"Saltea la instrucción siguiente si el bit b de f es 1", op:"skip si (f<b>) = 1",  c:"1 (2)", s:"",         e:"01 11bb bfff ffff", n:[3],     g:"t" },
    // ---- literal and control operations ---------------------------------------
    { m:"ADDLW",  o:"k",    d:"Suma la constante k a W",                       op:"(W) + k → (W)",              c:"1",     s:"C, DC, Z", e:"11 111x kkkk kkkk", n:[],      g:"l" },
    { m:"ANDLW",  o:"k",    d:"AND de la constante k con W",                   op:"(W) AND k → (W)",            c:"1",     s:"Z",        e:"11 1001 kkkk kkkk", n:[],      g:"l" },
    { m:"CALL",   o:"k",    d:"Llama a la subrutina en k y apila la dirección de retorno", op:"PC+1 → pila; k → PC", c:"2", s:"",        e:"10 0kkk kkkk kkkk", n:[],      g:"l" },
    { m:"CLRWDT", o:"",     d:"Reinicia el watchdog y su preescalador",        op:"00h → WDT, 1 → TO, 1 → PD",  c:"1",     s:"TO, PD",   e:"00 0000 0110 0100", n:[],      g:"l" },
    { m:"GOTO",   o:"k",    d:"Salta a la dirección k",                        op:"k → PC<10:0>",               c:"2",     s:"",         e:"10 1kkk kkkk kkkk", n:[],      g:"l" },
    { m:"IORLW",  o:"k",    d:"OR de la constante k con W",                    op:"(W) OR k → (W)",             c:"1",     s:"Z",        e:"11 1000 kkkk kkkk", n:[],      g:"l" },
    { m:"MOVLW",  o:"k",    d:"Carga la constante k en W",                     op:"k → (W)",                    c:"1",     s:"",         e:"11 00xx kkkk kkkk", n:[],      g:"l" },
    { m:"RETFIE", o:"",     d:"Vuelve de la interrupción y vuelve a habilitarlas", op:"pila → PC, 1 → GIE",      c:"2",     s:"",         e:"00 0000 0000 1001", n:[],      g:"l" },
    { m:"RETLW",  o:"k",    d:"Vuelve de la subrutina dejando k en W",         op:"k → (W); pila → PC",         c:"2",     s:"",         e:"11 01xx kkkk kkkk", n:[],      g:"l" },
    { m:"RETURN", o:"",     d:"Vuelve de la subrutina",                        op:"pila → PC",                  c:"2",     s:"",         e:"00 0000 0000 1000", n:[],      g:"l" },
    { m:"SLEEP",  o:"",     d:"Pone el chip en reposo hasta que algo lo despierte", op:"00h → WDT, 1 → TO, 0 → PD", c:"1", s:"TO, PD",   e:"00 0000 0110 0011", n:[],      g:"l" },
    { m:"SUBLW",  o:"k",    d:"Resta W de la constante k (k − W)",             op:"k − (W) → (W)",              c:"1",     s:"C, DC, Z", e:"11 110x kkkk kkkk", n:[],      g:"l" },
    { m:"XORLW",  o:"k",    d:"XOR de la constante k con W",                   op:"(W) XOR k → (W)",            c:"1",     s:"Z",        e:"11 1010 kkkk kkkk", n:[],      g:"l" }
  ];

  const GROUPS = {
    b: "Operaciones sobre registros (byte)",
    t: "Operaciones sobre bits",
    l: "Constantes y control"
  };

  // Datasheet notes 1–3, reworded for students.
  const NOTES = {
    1: "Cuando se modifica un registro de E/S en función de sí mismo (por ejemplo MOVF PORTB, 1), " +
       "el valor que se usa es el que hay en los pines, no el del latch.",
    2: "Si se ejecuta sobre TMR0 con d = 1, se borra el preescalador (si está asignado al Timer0).",
    3: "Si el salto se toma, la instrucción tarda dos ciclos: el segundo se ejecuta como un NOP."
  };

  // Field legend — the datasheet's Table 15-1, trimmed to what the students write.
  const FIELDS = [
    ["f", "Dirección del registro (0x00 a 0x7F)"],
    ["W", "Registro de trabajo (acumulador)"],
    ["b", "Número de bit dentro del registro (0 a 7)"],
    ["k", "Constante o etiqueta"],
    ["d", "Destino: 0 = el resultado va a W · 1 = vuelve al registro f (por defecto, 1)"]
  ];

  const BY_MNEMONIC = {};
  for (const i of ISA) BY_MNEMONIC[i.m] = i;

  const api = { ISA, GROUPS, NOTES, FIELDS, BY_MNEMONIC,
                get: (m) => BY_MNEMONIC[String(m || "").toUpperCase()] || null,
                source: "Microchip PIC16F627A/628A/648A — DS40044F, tabla 15-2" };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NP_ISA = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
