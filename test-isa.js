// SimuPIC — cross-check runtime/isa.js (the reference table shown to students)
// against runtime/asm.js (the assembler that actually emits the opcodes).
// Run: node test-isa.js
const ISA = require("./runtime/isa.js");
const ASM = require("./runtime/asm.js");

let fail = 0;
const bad = (m) => { console.error("  ✗ " + m); fail++; };

// 1. Same 35 mnemonics on both sides.
const isaM = ISA.ISA.map((i) => i.m).sort();
const asmM = Object.keys(ASM.OPS).sort();
if (isaM.length !== 35) bad(`isa.js tiene ${isaM.length} instrucciones, deberían ser 35`);
for (const m of asmM) if (!isaM.includes(m)) bad(`${m} está en asm.js pero falta en isa.js`);
for (const m of isaM) if (!asmM.includes(m)) bad(`${m} está en isa.js pero falta en asm.js`);

// 2. Encoding string agrees with the assembler's base opcode.
//    Fixed bits (0/1) must match; variable bits (d f b k x) must be 0 in the base.
for (const i of ISA.ISA) {
  const op = ASM.OPS[i.m];
  if (!op) continue;
  const bits = i.e.replace(/\s/g, "");
  if (bits.length !== 14) { bad(`${i.m}: el encoding tiene ${bits.length} bits, deberían ser 14`); continue; }
  for (let k = 0; k < 14; k++) {
    const want = bits[k], got = (op.b >> (13 - k)) & 1;
    if (want === "0" || want === "1") {
      if (got !== +want) bad(`${i.m}: bit ${13 - k} es ${got} en asm.js y ${want} en el encoding`);
    } else if (got !== 0) bad(`${i.m}: bit ${13 - k} es variable (${want}) pero vale 1 en la base de asm.js`);
  }
  // 3. Operand shape agrees with the assembler's operand type.
  const shape = { fd: "f, d", f: "f", "": "", fb: "f, b", k: "k", a: "k" }[op.t];
  if (shape !== undefined && shape !== i.o) bad(`${i.m}: operandos "${i.o}" vs tipo "${op.t}" de asm.js`);
}

// 4. Every row is complete and its cycles/notes are plausible.
for (const i of ISA.ISA) {
  for (const f of ["m", "o", "d", "op", "c", "e", "g"]) if (i[f] === undefined) bad(`${i.m}: falta el campo ${f}`);
  if (!/^(1|2|1 \(2\))$/.test(i.c)) bad(`${i.m}: ciclos "${i.c}" fuera de lo esperado`);
  if (!ISA.GROUPS[i.g]) bad(`${i.m}: grupo desconocido "${i.g}"`);
  for (const n of i.n) if (!ISA.NOTES[n]) bad(`${i.m}: nota ${n} inexistente`);
  if (i.c === "1 (2)" && !i.n.includes(3)) bad(`${i.m}: salta condicionalmente pero no cita la nota 3`);
  if (i.s && !/^(C|DC|Z|TO|PD)(, (C|DC|Z|TO|PD))*$/.test(i.s)) bad(`${i.m}: flags "${i.s}" mal escritos`);
}

console.log(fail ? `\n${fail} problema(s) en la tabla del set de instrucciones` : "✓ isa.js coincide con asm.js — 35 instrucciones, encodings y operandos");
process.exit(fail ? 1 : 0);
