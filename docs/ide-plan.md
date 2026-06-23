# SimuPIC — Built-in ASM editor + assembler ("IDE") — design plan

> **📋 Proposed (2026-06-22). Not built yet.** Approved direction: a dependency-free,
> in-browser PIC assembler + editor so students can write `.asm`, build it to Intel HEX, and
> run it in the existing simulator — **on a phone, with no MPLAB.** Agreed v1 scope: assemble
> the **real course TPs** (full classroom MPASM subset, including macros). This document is the
> design record; it changes nothing yet.

## Why

Today, firmware must be built in MPLAB on a PC and imported as `.hex`. That blocks the "open
the URL on your phone and just try something" path that makes the rest of SimuPIC work in
class. A built-in editor + assembler closes the loop: **editar → Compilar → ejecutar**, fully
client-side and offline-capable like the rest of the PWA.

> **Scope note — this reverses a documented decision.** `CLAUDE.md` / `README.md` currently say
> *"no built-in assembler (firmware arrives as Intel HEX from MPLAB)."* Santiago approved adding
> one (2026-06-22). Those scope lines must be updated when this ships.

## Decisions (agreed)

- **Plain JS — not the Rust core, not a gpasm port.** Assembling is pure text→bytes with no
  timing concerns, so it does **not** belong in the cycle-accurate core. Keeping it JS means the
  WASM and its 83 tests stay untouched (no rebuild per assembler fix), the work can be built
  *and* tested in-session, and it stays dependency-free. (Porting `gpasm`/gputils via Emscripten
  was rejected: heavy C toolchain, large blob, breaks the "zero third-party code" stance.
  DJPASM was rejected: 16F84-only and unmaintained.)
- **Output is Intel HEX → the existing path.** The assembler emits the same `.hex` text the
  import button already takes, then calls the existing `loadHex()` / `np_load_hex`. Nothing in
  the run loop or the core changes.
- **v1 must assemble the real TPs.** That requires the full classroom MPASM subset including the
  preprocessor (`MACRO/ENDM`, `#define`, `CBLOCK/ENDC`) — `examples/TP 2022` and friends use all
  three.
- **Dependency-free editor.** A hand-rolled `<textarea>`-based editor; no CodeMirror/Ace. Honors
  the no-third-party stance and the meta-CSP (`script-src 'self' …`; no `eval` / `new Function`).
- **The corpus is the test oracle.** `examples/*.asm ↔ .hex` (and the e2e pair) must assemble
  byte-for-byte — or at least run-identical — to the MPLAB output.

## Data flow

```
.asm text (editor)
   │  preprocess  (#include headers, #define, CBLOCK, MACRO expansion, IF/ENDIF)
   ▼
flat line/token stream
   │  pass 1   build symbol table (labels, EQU/CBLOCK vars, header symbols); track location
   │  pass 2   evaluate operands + encode each of the 35 instructions
   ▼
program words + __CONFIG  ──emit──▶  Intel HEX text
   │
   ▼   (unchanged from today)
loadHex(text) → np_load_hex → run in the cycle-accurate core
```

## What the assembler covers (grounded in `examples/`)

Required for v1 (all observed in the real TPs):

- **Header include** `#include <P16F628A.INC>` → a **built-in symbol table** (registers + bit
  names: STATUS/RP0/Z/C, PORTA/B, TRISA/B, INTCON/T0IF/GIE/T0IE, OPTION_REG/T0CS/PSA/PSn, TMR0,
  PCL, CMCON, EECON…). ~150 fixed entries shipped with the app; the `#include` line is accepted
  and satisfied internally — there is no virtual file system.
- **Directives:** `__CONFIG`, `ORG`, `EQU`, `CBLOCK/ENDC`, `END`, and `$` (location counter).
- **Preprocessor:** `#define` (constants *and* instruction-valued, e.g.
  `#define APAGAR CLRF PORTA`), `MACRO…ENDM` with parameters + invocation expansion, and
  `IF/IFDEF/ELSE/ENDIF` (cheap to add alongside).
- **All 35 instructions,** with destination (`,W`/`,F`/`,0`/`,1`) and bit (`,Z`, `,RP0`, `,0`)
  operands; `RETLW` lookup tables driven by `ADDWF PCL`.
- **Pseudo-ops:** `BANKSEL` (→ `bcf`/`bsf STATUS,RP0/RP1`); accept `PAGESEL` (a no-op on a 2K
  part).
- **Number radixes:** `0x1F` / `H'1F'`, decimal `.198` / `D'198'`, binary `b'1010'`, and the
  **bare-hex default radix** (`__CONFIG 3F10`).
- **Expressions:** numbers, symbols, `$`, and the common operators (`+ - * / & | << >>`,
  parentheses, `HIGH`/`LOW`) — enough for `.255`, table offsets, config math.
- **Comments** `;…`; tolerate non-UTF-8 source (the sample files are Latin-1) by only caring
  about bytes before `;` and decoding leniently.

Deferred (not in v1):

- A linker / relocatable objects, multiple source files, `#include` of arbitrary user files.
- The full MPASM expression/operator surface, `LOCAL`, deeply nested/recursive macros beyond
  what the TPs use, `while` / `#v(...)`, etc.
- Any other PIC. (16F628A only, like the rest of SimuPIC.)

## Built-in P16F628A symbol table

Shipped as a JS object `{ NAME: addr | bitpos }`, derived from `P16F628A.INC` / the datasheet.
The `#include` directive simply confirms the part and loads this table; there is no file
system. This is the single biggest "data, not logic" chunk and is trivial to verify against the
corpus — every symbol the TPs reference must resolve.

## Instruction encoder

The inverse of the disassembler already in `core/src/decode.rs`: the same opcode/operand
layout, so it is a direct mirror — a table of `{ mnemonic → (opcode pattern, operand shape) }`.
The disassembler doubles as a cross-check: assemble → `np_disasm` → compare back to the source
mnemonic.

## Diagnostics

Errors carry **source line numbers** (and, inside a macro, the expansion site), shown in a list
under the editor — e.g. `L42: símbolo desconocido 'POBRTB'`, `L7: falta ENDC`. Good messages are
half the pedagogical value, so this is in scope, in Spanish (es-AR), consistent with the UI.

## Editor UI (`runtime/index.html`)

- A new **"Código"** surface (a panel/tab by the board, or a toggle like the Depurador): a
  monospace `<textarea>`, a **Compilar y ejecutar** button, and an error list.
- **Persistence:** the current buffer is saved in `localStorage` (like the watch list) and
  survives reload.
- **On success:** assemble → `loadHex` → auto-run (reuses the existing play/stop transport).
- **Phone affordances:** a small toolbar of awkward-on-mobile tokens — Tab/indent, `,`, `0x`,
  `b'`, `;`, and common mnemonics — inserted at the caret. This is the main reason the feature
  exists, so it is v1, not polish.
- **Starter content:** a tiny commented blink template, so the editor is never empty.
- **Deferred:** syntax highlighting (doable dependency-free via an overlay, but extra work),
  multiple files/tabs, find-and-replace.
- **CSP:** all same-origin JS, no `eval` / `new Function` (the expression evaluator is a real
  parser), so the meta-CSP needs no change.

## Test strategy

1. **Corpus oracle (primary):** a Node harness assembles every `examples/*.asm` plus the e2e
   `test.asm` and diffs the produced HEX against the committed `.hex`. Byte-identical is the
   goal; where MPASM and we legitimately differ (e.g. fill/pad bytes), fall back to
   **run-identical** — load both, run N cycles, compare PORTA/PORTB + key registers.
2. **Unit tests:** per-directive and per-instruction encode tests (Node).
3. **In-browser:** assemble in the page, run, eyeball the board — the same loop used throughout
   this project.

No Rust / `cargo` is involved; all of the above runs directly, without Santiago rebuilding the
WASM.

## Phases

0. **Assembler core + preprocessor** (the lift). Tokenizer → preprocess
   (include/define/cblock/macro/if) → two-pass assemble → encode → Intel HEX → diagnostics.
   **Done = every `examples/*.asm` assembles to a byte- or run-identical `.hex`.** No UI yet.
1. **Editor panel + wiring.** Textarea + Compilar + error list + `localStorage` + build→load→run,
   plus the starter template. Verify in-browser.
2. **Phone affordances.** Token toolbar, textarea autosize, an "Ejemplos" menu (blink, 7-seg,
   mux) that loads source into the editor.
3. **Polish.** More directives / expression surface as the corpus demands, optional syntax
   highlighting, "Descargar .hex / .asm", clearer error formatting.

## Risks & mitigations

- **Preprocessor breadth (macros / `#define` / `CBLOCK`) is the main risk.** Mitigation: scope
  strictly to what the corpus uses; the corpus diff catches regressions immediately.
- **MPASM corner cases** (default radix, operator precedence, `#define` re-expansion order).
  Mitigation: corpus + targeted unit tests; document any intentional divergence.
- **Source encoding** (the sample files are Latin-1, not UTF-8). Mitigation: decode leniently and
  ignore bytes after `;`.
- **Mobile editing ergonomics** are inherently limited in a `<textarea>`. Mitigation: the token
  toolbar; revisit a richer editor only if students need it.
- **Scope creep toward "be MPLAB."** Mitigation: the deferred list above; 16F628A only.

## Docs to update when it ships

- `CLAUDE.md` and `README.md`: replace the "no built-in assembler" scope lines.
- `STATUS.md`: a session-log entry per phase.
- `README.md` student instructions: add the "write code in the browser" path alongside MPLAB.

## Not planned (by request / out of scope)

- Other PICs, analog, a linker, multi-file projects, a C compiler.
- Replacing MPLAB — this is a "try it on your phone" convenience, not the canonical toolchain.
