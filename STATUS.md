# SimuPIC — project status

A browser-based, OS-agnostic, **cycle-accurate PIC16F628A simulator** for the
classroom (codename *New Proteus*). **Shipped and live:**
<https://santibianco.github.io/SimuPIC/>. See `README.md` (overview), `DEPLOY.md`
(hosting + Moodle), and `docs/architecture.md` (the load-bearing spec).

## Session log (newest first) — update this at the end of each session

- **2026-06-18 (lab setup)** — Boards are now teacher-managed, not student-uploaded. Removed the
  **`.json` diagram upload** from the runtime. The dropdown now **groups by a per-board `group`
  label** the teacher chooses (defaults to "Trabajos Prácticos"; built-ins → "Ejemplos"; teacher
  boards listed first). The **authoring tool** (`runtime/authoring.html`) gained a **board
  library** (add / edit / remove, persisted in `localStorage`). It **auto-imports the existing
  `labs.js`** on open (seeds the library; plus an **Import labs.js** button), and **"💾 Save
  labs.js"** overwrites `runtime/labs.js` directly via a **localhost-only `POST /__save_labs`**
  endpoint added to `serve.js` (`window.NP_LABS=[{name,group,components}]`), falling back to a
  download if serve.js isn't reachable. **Restart `serve.js` once** to enable the write endpoint.
  Verified dropdown grouping, round-trip export, and auto-import of the 2 existing boards. *Uncommitted.*
- **2026-06-18 (seg pin map)** — 7-seg displays now show the explicit **segment→pin map**
  instead of the `seg RB1–RB7` range: a shared key `a RB1 · b RB2 · … · g RB7` once below the
  display row (when displays share segment pins — the usual multiplexed case), plus each
  display's own **`com RAx`** badge; a per-display 2-column legend is the fallback for displays
  with different pins. `drawSegKey` / `drawSegLegend` in `runtime/index.html`. Verified on
  TP-Dificil (4), the mux (2), and the single-seg counter. *Uncommitted.*
- **2026-06-18 (pin states)** — Added **live pin-state squares** on the chip pins, Proteus-style:
  red = 1, blue = 0, grey = no defined value. Read PORTA/PORTB + TRISA/TRISB each frame in
  `drawChip` (live while running, holds when paused). Rule: **outputs** always show their
  driven level; an **input** shows a level only if a button is wired to it (`buttonPins`, from
  the diagram) — so it idles per the button's polarity (active-low → red, active-high → blue)
  and flips on press; **unused inputs and VSS/VDD stay grey**. The pin name shifts just
  outboard of the square. Verified idle + press on the mux board. *Uncommitted.*
- **2026-06-18 (board view)** — Reworked how the board shows connections (`runtime/index.html`,
  canvas drawing only — no core change). Explored a labeled segment bus and tidy direct
  right-angle wiring, but both still read busy on the 4-display TP, so **settled on
  labels-only**: *no wires at all* — every component carries a **pin badge** (LED / button →
  its pin; 7-seg → a "seg RB1–RB7 · com RAx" badge), and students read each connection by name
  against the chip's pin labels. This also frees the layout (displays moved up + enlarged,
  parts placed for clarity). `build()` now emits badge specs only; `drawWiring()` renders the
  badges on top; `sample`/`integrate` timing untouched. Verified in-browser on TP-Dificil
  (4 displays + 2 buttons), the 2-digit mux (digits still persist + Status LED), and the
  8-LED demo. *Uncommitted.*
- **2026-06-18 (UI revamp)** — Reworked the runtime UI (`runtime/index.html`, CSS + layout
  only — **no core/wasm change**): **dark + light themes** via CSS variables with a **toggle**
  in the app bar (persisted in `localStorage` `np_theme`, no-flash inline head script,
  defaults to `prefers-color-scheme`); a **restructured layout** — top app bar (brand + theme
  switch) · left side-rail with Placa / Simulación / Archivos cards + status · centered board ·
  docked Depurador panel; and a friendlier "classroom" style (rounded cards, softer surfaces,
  indigo accent, larger controls). All element IDs / JS hooks preserved. Verified in-browser in
  **both themes**: board + 2-digit multiplex render, controls, theme persistence across reload,
  and the full debugger (Programa / Datos / SFR / Vigilar, PC highlight, breakpoints, editing)
  all intact; responsive `@media (max-width:920px)` rule confirmed in the CSSOM. Pure runtime
  change → **no wasm rebuild / embed / verify-core needed**. *Uncommitted.*
- **2026-06-18 (v2)** — Debugger v2: **breakpoints** (click a program row; the run stops
  there, resume steps past it — core `np_set_break`/`np_clear_break`/`np_break_hit`, the
  scheduler stops at a marked PC), **Paso ×10/×100**, and **live memory editing** (click a
  data cell or SFR value → `np_write_data`/`np_set_w`). Verified in-browser. *Uncommitted.*
- **2026-06-18** — Added a read-only **debugger (Depurador)**: core accessors
  (`np_pc/np_w/np_cycles/np_read_data/np_prog_word/np_disasm/np_step` in `core/src/lib.rs`
  + `wasm.rs`, unit-tested + checked by `verify-core.js`) and a collapsible runtime panel
  with single-step and Programa / Datos / SFR / Vigilar tabs. Also: cross-frame brightness
  persistence (slow-multiplex fix), the **SimuPIC** rename, and `embed-core.js` (a
  PowerShell-safe replacement for the inline `node -e` embed). *Uncommitted at write time.*

## Layout

- `core/` — Rust → WASM cycle-accurate simulation core (the heart). 82 tests.
- `runtime/` — browser UI (the deployable student app): `index.html` (WASM loader
  + Canvas board), `core-wasm.js` (embedded core, generated), `labs.js` (instructor
  lab boards → the "pick a board" dropdown), `manifest.json` + `sw.js` + `icon.svg`
  (PWA), `authoring.html` (instructor-only diagram editor).
- `serve.js` (project root) — tiny static server for local dev (`node serve.js`).
- `embed-core.js` / `verify-core.js` — embed the built wasm into `core-wasm.js`, then
  validate it (EEPROM + debugger fixtures). Always run `verify-core.js` after embedding.
- `DEPLOY.md` + `.github/workflows/pages.yml` — GitHub Pages deploy + Moodle embed.
- `examples/` — real MPLAB lab `.hex`/`.asm` pairs used as decode cross-checks.
- `diagrams/` — JSON board definitions (architecture §6); `lab-counter.example.json`.

## Status — implemented + tested

- **CPU**: all 35 PIC14 instructions, STATUS flags (Z/C/DC incl. subtract borrow),
  8-level stack, computed `PCL` jumps, exact cycle counts. (step 1)
- **TMR0** + prescaler + `T0IF`; **interrupt** vectoring (GIE, T0IE/INTE/RBIE),
  `RETFIE`. (step 2)
- **Per-pin on-time sampling** for 7-seg persistence of vision. (step 3)
- **Input pins**: TRIS-aware reads + `set_pin` (buttons) + RB0/INT + PORTB-change. (step 4 core)
- **WASM**: dependency-free C-ABI (no wasm-pack) — `core/src/wasm.rs`.
- **Browser runtime**: DIP-18 board with live pin-state squares + per-component pin
  labels, LEDs / 7-seg / buttons, clock control, a teacher-managed "pick a board"
  dropdown grouped by lab (`labs.js`), four demos, and a **Spanish (es-AR) UI**.
  Verified in-browser.
- **Debugger (Depurador)**: collapsible read-only inspector for everyone — single-step
  (`np_step`), live Ciclos/PC/W/STATUS header, program memory with disassembly + PC
  highlight, data-memory grid (bank 0/1), named SFRs with bit breakdowns, and a watch/
  filter (by address or register name, persisted in `localStorage`). Cycle-exact.
- **EEPROM** (EECON1/EECON2 unlock; persists across reset/power-cycle). Demo
  climbs 1→2→3 across the Reset (power-cycle) button. (step 5)
- **Authoring tool** (`runtime/authoring.html`, instructor-only): visual editor —
  add LED/button/7-seg, assign pins (per-segment for 7-seg), button polarity +
  labels, live preview, export/import JSON. Round-trips to the student runtime.
- **PWA**: `manifest.json` + network-first `sw.js` (offline + installable) +
  responsive canvas. Deploy via `.github/workflows/pages.yml`; see `DEPLOY.md`.
- **Deployed & live** at <https://santibianco.github.io/SimuPIC/> (GitHub Pages via
  Action on every push); embeddable in Moodle. Bundled instructor boards:
  *TP - Simple*, *TP - Dificil*.

## Build / test / run

```sh
# 1. test the core
cd core && cargo test

# 2. build the wasm (Windows host)
cargo rustc --release --target wasm32-unknown-unknown --crate-type cdylib

# 3. embed it so the page is self-contained (run from project root).
#    GOTCHA: `cargo rustc --crate-type cdylib` writes the .wasm to release/DEPS/.
#    Use the script — the old inline `node -e` one-liner gets mangled by PowerShell.
node embed-core.js

# 3b. VERIFY the embed before trusting it — validates the wasm and runs the EEPROM
#     + debugger fixtures. Must print both ✓.
node verify-core.js

# 4. run the runtime
node serve.js        # -> http://localhost:8080
```

Division of labor: the wasm build runs on the Windows host; the embed step and
file wrangling can be done from the agent's mounted shell.

## Pending / next (all optional — the project is shipped)

- Embed the live URL in the Moodle course (iframe snippet in `DEPLOY.md`).
- More instructor lab boards: build them in `authoring.html` (it auto-loads the current
  `labs.js`), **Save to lab list**, then **💾 Save labs.js** to overwrite `runtime/labs.js`
  directly (needs `serve.js` running) → commit + push and they appear in the student
  dropdown under the **group** you set on each board.
- Authoring niceties: drag-to-position, a "Test against a .hex" preview, honor
  `x`/`y` in the runtime (currently auto-placed around the chip).
- (simplified) internal pull-ups (RBPU) — not modeled; add if a lab needs it.

## Reconciliation items (vs MPLAB)

- Interrupt entry-cycle count (`INTERRUPT_ENTRY_CYCLES = 2`) and exact TMR0
  reload-ISR period — confirm against MPLAB's stopwatch on a timer lab.
- External TMR0 clock (`T0CS = 1`, counting T0CKI edges) is not modeled.
