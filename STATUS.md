# SimuPIC — project status

A browser-based, OS-agnostic, **cycle-accurate PIC16F628A simulator** for the
classroom (codename *New Proteus*). **Shipped and live:**
<https://santibianco.github.io/SimuPIC/>. See `README.md` (overview), `DEPLOY.md`
(hosting + Moodle), and `docs/architecture.md` (the load-bearing spec).

## Session log (newest first) — update this at the end of each session

- **2026-09-01 (manual embebido + set de instrucciones on demand)** — Santiago preguntó cómo meter el manual de
  usuario dentro del simulador y cómo mostrar «las primeras columnas» de la tabla 15-2 del datasheet. Elegimos la
  variante liviana: **el manual entra como texto, sin las 23 capturas** — son fotos de la pantalla que el alumno está
  mirando, y pesaban 3,5 MB contra los 247 KB de toda la app. Tres piezas nuevas:
  1. **`docs/manual.md` es ahora la fuente única del manual** (extraído del docx con un parser de `word/document.xml`
     que preserva headings, listas, tablas y los recuadros). Los epígrafes de las figuras quedaron plegados dentro de
     `<!-- figura N · … -->`, para que un manual impreso los conserve y la ayuda embebida no muestre pies de fotos que
     no están. **Ojo: `docs/SimuPIC-Manual-de-usuario.docx` ya NO es la fuente** — quedó atrás y hay que regenerarlo
     desde el .md la próxima vez que se reparta.
  2. **`node build-help.js` genera `runtime/help.js`** (25 KB, 12 secciones) desde ese .md. La página sigue sin build
     step: `help.js` se commitea, igual que el core en base64. El drawer tiene índice, scroll-spy y un buscador que
     **ignora tildes** (fold de a un carácter, así los offsets siguen sirviendo para envolver en `<mark>`).
  3. **`runtime/isa.js`** — las 35 instrucciones con mnemónico, operandos, descripción en castellano, la Operation del
     datasheet, ciclos, flags, encoding de 14 bits y las notas 1-3. **`node test-isa.js` la cruza contra `OPS` de
     `asm.js`**: mismos 35 mnemónicos, bits fijos del encoding idénticos a la base del ensamblador y forma de los
     operandos coherente. Verde.
  **UI:** dos botones nuevos en la barra (`#helpBtn`, `#isaBtn`) → drawer del manual y modal de la tabla (filtrable por
  mnemónico, descripción o flag), más **tooltips al pasar el mouse** sobre un mnemónico en el editor y en la vista
  Programa. Detalle no obvio: `.edHl` tiene `pointer-events:none`, así que `elementsFromPoint` no devolvía los tokens;
  se rehabilitan sólo en `.edHl .tk-key` (el textarea sigue arriba y se queda todos los eventos reales). El scroll-spy
  usa rects y no `offsetTop`, porque `#helpDoc` no está posicionado y `offsetTop` medía contra el panel.
  `sw.js` → **simupic-v4**, con `isa.js` y `help.js` en el SHELL (offline). Si esos dos archivos faltan, los botones se
  esconden solos y la app arranca igual — verificado.
  **Corrección de contenido:** la tabla «Cómo leer la placa» decía «Rojo = 1, gris = 0 o entrada», anterior al
  recoloreo del 2026-08-14. Ahora dice rojo 1 · azul 0 · gris indefinido · ámbar conflicto de TRIS, que es lo que
  `drawChip` realmente pinta. Y el dato de que los SFR van en violeta hasta 0x20 (que sólo vivía en un epígrafe) pasó
  al cuerpo de 8.4.
  Verificado con Playwright headless contra `runtime/` servido local: 30 chequeos en verde (manual, buscador, modal,
  filtros, tooltips, foco y Esc), capturas en ambos temas y en 390/360 px — la barra superior entra sin desbordar.
  **No verificado en el Chrome de Santiago: `localhost:8080` no respondía en esta sesión.** Cambio puro de runtime →
  no hace falta rebuild del wasm. *Sin commitear.*


- **2026-08-15 (board labels: one badge per component, on its own pin row — no more clashes)** — Santiago
  spotted overlapping labels on **Ejercicio 2** and asked whether the recolour had resized the LEDs or moved
  things. It hadn't: all geometry (`arc(x,y,15)`, `p.x+dir*52`, `bw=72/bh=48`, `DISP_TOP`, `CHIP`) was
  byte-identical, and the same collision measured **30×11px in *dark* mode too** — i.e. it predated the
  recolour. (What *did* change perceptually: `drawLed`'s new opaque base makes an **unlit** LED read as a
  solid circle instead of a nearly-invisible one, so LEDs look more prominent — same radius.)
  Two real defects, both structural, found by a **geometric clash audit** over all 10 bundled boards
  (`labs.js` + built-ins) comparing every label box against every other label **and every component body**:
  1. **LED captions.** A labelled LED emitted *two* labels — a centred `RBn` badge plus a **transparent**
     caption 23px above the bulb. Rows are 32px apart and a bulb is 30px tall, so the caption had nowhere to
     go and was drawn **on the neighbouring bulb** (Ejercicio 1 ×3, Ejercicio 2 ×1) — plain text over a
     coloured circle, unreadable.
  2. **Button labels.** `"Pulsador · RB0"` sat *below* its glyph at `p.y+37` — 5px past the next pin row —
     so it covered RB1's badge on Ejercicio 2.
  **Fix (one rule, applied to both):** every component now emits **exactly one opaque badge, vertically
  centred on its own pin row**, with the custom label folded into the pin name (`"LED · RB1"`,
  `"Pulsador · RB0"` — the button convention, now used everywhere). Badges are anchored by their **inner
  edge** and grow outboard via a new optional `grow` arg on `drawPinBadge` (−1/+1), instead of being centred:
  LEDs at `p.x+dir*75` (8px clear of the bulb), buttons at `p.x+dir*164` (8px clear of the glyph's outer
  edge). **Why this is clash-proof:** one component per pin → one badge per row; rows are 32px apart and a
  badge is 16px tall, so neighbouring rows always keep 16px of clearance *no matter how long an instructor's
  label is* — a wide label now grows into empty outboard space instead of sideways into the next row.
  Unlabelled LEDs shift ~2px; the `cap` label kind is no longer emitted (its draw branch is left in place,
  harmless).
  **Audit result: 0 clashes on all 10 boards** (was 8 boards). The audit still flags the 7-seg
  `com RAx` badges and the segment key as "overlapping" their display module by 11px/3px — that is
  **deliberate and legible**: they're opaque plates sitting on the module's dark bezel, like silkscreen, and
  the audit is purely geometric so it can't tell an opaque plate from transparent text. Left as-is.
  Verified by headless render (Playwright, WASM core stubbed) in **both themes** on Ejercicio 1/2/3 and
  4 Displays; inline scripts pass `vm.Script`. **Not yet re-checked on localhost in Santiago's Chrome.**
  Pure runtime change → no wasm rebuild/embed/verify-core. *Uncommitted.*

- **2026-08-14 (light board for classroom projection — theme-aware canvas palette)** — Feedback from a
  colleague projecting SimuPIC in class: the dark-green board washes out on a projector. The board is drawn
  on a `<canvas>`, so it couldn't follow the CSS theme vars — every colour was hardcoded for a dark backdrop.
  Added **`BOARD_THEMES` (light/dark) + a live `BP` pointer** in `runtime/index.html`, the canvas equivalent
  of the `[data-theme]` blocks; **all 44 colour sites** across `drawChip`/`drawLed`/`drawSeven`/`drawButton`/
  `drawPinBadge`/`drawSegKey`/`drawSegLegend`/`drawWiring` now read from `BP`. `applyBoardPalette()` runs at
  startup and from the theme toggle; the rAF loop repaints the next frame, so no explicit redraw. Light theme
  `--board` is now **`#f8fafd`** (was `#0e1f17` in *both* themes); the floating zoom bar also became
  theme-aware via new `--zbar-*` vars (it would otherwise stay dark-on-light).
  **Deliberate:** the **DIP chip body and the 7-seg display face stay dark in both themes** — that's what the
  real parts look like, and it's what keeps the white chip text and red segments readable when projected
  (red-on-white would wash out, defeating the point). Everything drawn *on* the board (pin names, badges,
  segment key, wires, button glyphs) flips to dark ink on light. `drawLed` now paints an **opaque body first**
  (`BP.ledBase`) because the red gradient is semi-transparent at low brightness and an unlit LED would
  otherwise vanish into a white board — on dark, `ledBase` *is* the board colour, so the old look is byte-for-byte
  unchanged. Pin-state semantics preserved everywhere (red 1 · blue 0 · grey undefined · amber TRIS conflict),
  just deepened for contrast on white (`#f0594e`→`#dc3a2e`, `#3f7fe0`→`#2a62d4`).
  **Verified by headless render** (Playwright + Chromium in the agent sandbox, WASM core stubbed for the port/
  TRIS reads `drawChip` makes — the live browser was unreachable that session): both themes screenshotted with
  8 LEDs at mixed brightness, a lit 7-seg digit, and both button polarities; zoom-bar computed styles checked
  per theme; inline scripts pass `vm.Script`. **Not yet re-checked on localhost in Santiago's Chrome.** Pure
  runtime change → no wasm rebuild/embed/verify-core. *Uncommitted.*

- **2026-07-27 (terminology → Debugger/Watch + collapsible zoom bar, collapsed by default)** — Two more UI
  fixes in `runtime/index.html`, no core/WASM change. (1) **Terminology:** the panel is now labelled
  **«Debugger»** (navbar toggle text + aria, dock title, close-button titles) and the debugger view formerly
  **«Vigilar»** is now **«Watch»** — Argentine students use the English debugger terms. Global rename:
  9× `Depurador`→`Debugger`, 3× `depurador`→`debugger`, 2× `Vigilar`→`Watch` (whole word only; camelCase ids
  like `saveWatch`/`dbgWatch`/`resolveWatch` untouched). Other Spanish view labels (Programa/Datos/SFR/Pila)
  left as-is. Older log entries below still say "Depurador" — they record what was done at the time.
  (2) **Zoom bar collapse:** the floating `−/100%/+/Ajustar` toolbar covered too much of the board (worst on
  phones). It's now wrapped in `#zoomCtrls` behind a magnifier toggle `#zoomToggle` and defaults **collapsed on
  every screen** — the board shows just the small magnifier; tap to expand, tap again to collapse. State
  persists in `localStorage.np_zoombar` (unset/"0" = collapsed, "1" = expanded); `.zoombar.collapsed` hides
  `.zoomCtrls`. `.stage.empty .zoombar` still hides the whole bar until a board is picked. Verified live in
  Chrome: desktop (1535px) and phone (664px) both load collapsed to one magnifier button; navbar/dock read
  «Debugger» and the debugger view list ends in «Watch»; tapping the magnifier expands the controls and
  persists; inline scripts pass a `vm.Script` syntax check. *Uncommitted.*

- **2026-07-27 (main menu — empty stage + gated compile + locked placeholder until a placa is chosen)** — On load the middle stage no
  longer renders a default board. Previously `runtime/index.html` ran `let components=build(LED_DIAGRAM)` at
  startup, so the PIC chip + 8 LEDs + button + wiring drew before any selection. Now `components=[]` and a new
  `boardLoaded` flag gates the canvas draw (chip/components/wiring render only once a board loads); a new
  `.stage.empty` state shows a centered hint ("Elegí una placa para empezar") and hides the zoom toolbar and
  board hint. `setDiagram()` calls `setBoardLoaded(true)`, so picking any placa/ejemplo reveals the circuit
  exactly as before. CSS + an HTML overlay (`.board-empty`) + JS only — **no core/WASM change**. Verified live
  in Chrome: fresh load shows the empty hint (stage class `stage empty`); selecting "Ejemplo · Parpadeo"
  renders the chip + LEDs running and restores the zoom controls (class back to `stage`); both inline scripts
  pass a `vm.Script` syntax check. Note: loading a raw `.hex` without first picking a placa leaves the stage
  empty by design (pick a board first). **Two follow-ups the same day:** (1) the **«Compilar y cargar» button
  (`#edBuild`) is now `disabled` until a board is loaded** — `setBoardLoaded()` flips it (disabled ⇄ enabled)
  alongside the stage state, with a "Elegí una placa antes de compilar" title while disabled; the existing
  core/asm guards in the click handler are unchanged. (2) the **placeholder `<option>` «— elegí una placa o
  ejemplo —» is now `disabled selected`** in `populateLabs()`, so it shows as the initial empty value but
  can't be re-selected once a real placa is chosen. Verified live: on load `edBuild.disabled===true` and the
  placeholder is greyed; after selecting "Ejemplo · Parpadeo" the board renders, `edBuild.disabled===false`
  (button solid blue), and the placeholder stays disabled. *Uncommitted.*

- **2026-07-05 (removed double-click-to-fit on the board)** — Dropped the canvas `dblclick` → zoom/reset
  handler (`runtime/index.html`); it fired when a student double-tapped a button to press it quickly and
  yanked the zoom. Fitting the board is still available via the **Ajustar** button and the +/− zoom controls,
  so nothing is lost; the board hint text no longer mentions "doble clic". Wheel/pinch zoom and drag-to-pan
  are unchanged. Verified live: double-clicking a button leaves `view.zoom` at 1 (no zoom/pan), zero console
  errors. Runtime-only, no core change. *Uncommitted.*

- **2026-07-05 (buttons → schematic push-buttons with a 0/1 rail + live badge)** — Redrew the board
  buttons (`runtime/index.html`: canvas `drawButton` + the `build()` button branch; **no core/WASM change**)
  from the plain dark rounded box into a **schematic momentary push-button** that reads like a real circuit,
  so a student can see what a press does. Each button now shows: a movable **contact bar that drops and
  closes** onto two terminals when pressed; an outboard **rail symbol — GND (⏚) means a press drives 0,
  +V means a press drives 1**; and an actuator **cap that doubles as a live badge** of the level on the pin
  (**blue 0 / red 1**, matching the chip's pin-state squares), which **flips the instant you press**. The
  bar lights in the level colour when closed. Orientation follows the pin side (`dir`): the pin lead points
  toward the chip, the rail sits outboard. The pin name is now **always** drawn below the glyph (with any
  custom label as `LABEL · PIN`); the box grew 44→48px tall (press/hit behaviour unchanged). Colours are the
  same red `#f0594e` (1) / blue `#3f7fe0` (0) used by the pin squares. **Verified live in Chrome:** active-low
  (GND, idle 1 → press 0) and active-high (+V, idle 0 → press 1), on both left (RA*) and right (RB*) pins,
  released + pressed (bar closes + badge flips), and a real click still registers the press through the hit
  box; zero console errors. Pure runtime change → no wasm rebuild/embed/verify-core. *Uncommitted.*

- **2026-07-05 (navbar button sizing fix)** — The **"Cargar .hex"** navbar button rendered larger than the
  toggles next to it. Cause: `.barbtn` set `font:600 13px inherit`, which is **invalid CSS** — the `inherit`
  keyword can't appear inside the `font` shorthand, so the whole declaration was dropped. That left the
  `<button>` toggles (Código/Depurador) on the UA default (~13.3px/400) but the `<label>` file buttons
  (`#loadHexBtn`, `#wasmWrap`) on the inherited page font (**16px**) — hence the mismatch. Replaced it with
  valid separate properties `font-family:inherit; font-size:13px; font-weight:600;` so the whole bar is
  uniform (13px, semibold — the size/weight the shorthand had always intended). `runtime/index.html` CSS
  only, no core change. Verified live: `#loadHexBtn`, `#toggleEditor`, `#toggleDebug` all compute to
  13px/600. *Uncommitted.*

- **2026-07-05 (ASM editor — line numbers + syntax highlighting)** — The **Código (ASM)** editor now
  has a **line-number gutter** and **full MPASM syntax highlighting**. **New `runtime/editor.js`** — a
  self-contained, dependency-free, same-origin module (CSP-safe under `script-src 'self'`, offline via the
  SW, like `asm.js`/`labs.js`); **no core/WASM change** (the 82 tests + the embed are untouched, no rebuild).
  Technique: the classic **"highlight layer behind a transparent textarea"** — a `<pre class="edHl">` renders
  colour-spanned tokens, the real `<textarea id="edSrc">` sits on top with `color:transparent` + a visible
  `caret-color`, and the two + the gutter are kept in lock-step on scroll. Editing stays 100% native
  (selection, undo, IME, mobile keyboard). The tokenizer pulls its keyword tables from **`window.NP_ASM`**
  when present (the 35 mnemonics from `OPS`, SFR/bit/config names from `SFR`/`BIT`/`CFG`) so highlighting
  always agrees with what actually assembles, with a baked-in fallback if `asm.js` failed. Token classes:
  comments, mnemonics, directives, numbers (all radixes `0x`/`H''`/`B''`/`D''`/`.dec`/`'c'`), registers,
  and column-1 labels. `index.html`: wrapped `#edSrc` in `.edWrap` (gutter + `.edField` holding the `<pre>`
  and the textarea), moved the border/focus ring to the wrapper, added **theme-aware `--tok-*` colours to
  both palettes**, and made **`edSave()` call `NP_EDITOR.refresh()`** so every change — typing *and* every
  programmatic set (demo source, Abrir .asm, Limpiar, Tab-indent, clear-on-.hex) — re-highlights (initial
  render happens on `DOMContentLoaded`). `sw.js`: added `./editor.js` to the precache SHELL, cache **v2→v3**.
  **Verified live in Chrome, both themes:** line numbers + full highlighting render, caret stays aligned
  while typing (font/line-height/padding match exactly), horizontal + vertical + gutter scroll all sync
  (textarea scrolls internally when the dock is height-constrained — no regression), demo **Compilar y
  cargar** still loads/runs (13 instr), **zero console errors**. Pure runtime change → no wasm
  rebuild/embed/verify-core. *Uncommitted.*

- **2026-06-25 (clear the ASM editor when an unrelated .hex loads)** — `runtime/index.html` only. Loading a
  `.hex` that isn't from the editor now **empties the ASM editor** so stale code can't be mistaken for the loaded
  program (a brief note explains it). New `clearEditorSource()` is called from the **file-load** handler and the
  **drag-drop** handler (on success) and when a **Placa example has a `.hex` but no source**. It is *not* called by
  the editor's own **Compilar y cargar** (the source is the program) nor by **demos that carry their `.asm`** (those
  still populate the editor on purpose). Verified all three paths live + zero console errors. *Uncommitted.*

- **2026-06-25 (.hex load → navbar; dropped the Archivos card)** — `runtime/index.html` only, no core change.
  The **"Cargar programa (.hex)"** button moved out of the rail's *Archivos* card and into the **navbar** as a
  labelled icon button (`#loadHexBtn`, upload icon + "Cargar .hex"); on phones (≤640px) it's **icon-only with a
  tooltip**, like the other navbar buttons. The rare **core (.wasm) loader** (`#wasmWrap`) also moved to the navbar
  but is **hidden by default** and only appears when there's no embedded core (no-embed dev fallback). The whole
  **Archivos card was removed**, so the rail is now just *Placa · Simulación · status* (reclaims the wasted space).
  Both file `<input>`s are now `<label>`-wrapped in the navbar (native click → file picker; the existing
  `#hexFile`/`#wasmFile` change handlers are unchanged), and drag-and-drop a `.hex` onto the board still works.
  Mobile grid simplified (no more `archivos` row). Verified live: card gone, navbar **Cargar .hex** loads + runs a
  `.hex`, core stays hidden with the embed, zero console errors. *Uncommitted.*

- **2026-06-24 (UI revamp 2 — desktop/mobile usability)** — Reworked the runtime UI for legibility and
  to let students see more at once (`runtime/index.html` only — **CSS + HTML + JS, no core/wasm change**;
  the 82/83 tests + the embed are untouched, **no rebuild**). **(1) IDE-style layout.** The old top-to-bottom
  flow (board centred, Depurador a collapsible panel stacked under it) became a 3-zone CSS-grid workspace:
  **left controls rail · large board centre · resizable right-docked Depurador**, so the debugger is visible
  *beside* the board. New app-bar **"Depurador" toggle** (show/hide, persisted `np_dock`) and a **drag handle**
  to resize the dock (persisted `np_dock_w`, 320–720px). Responsive: ≤1200px the dock un-docks to a full-width
  panel below the board; ≤920px everything stacks (rail cards wrap). **(2) Two-pane customizable debugger**
  (the headline ask). On desktop the Depurador shows **two panes side by side, each with its own view picker**
  (Programa / Datos / SFR / Pila / Vigilar) — a student can watch e.g. the program *and* a watch list / the
  SFRs at the same time; per-pane choice + data bank persist (`np_panes`). The **second pane is closable** (✕ on
  its header) and reopens via a **⊞ button** on the first pane (persisted, `np_split`) — the side-by-side view is
  optional. Below 1200px it collapses to a single pane (dual view is desktop-only, by design). Rewrote the old single-tab view system: each view now renders
  into a **pane-scoped** container, with **delegated** handlers on `#dbgPanes` for breakpoints, bank switch,
  watch add/remove and inline cell/SFR hex edit — **all prior debugger features preserved** (breakpoints, Paso
  ×1/×10/×100, live PC highlight, inline edit, watch persistence, the 8-level stack). **(3) Board zoom + pan.**
  Scroll/pinch to zoom (about the cursor), drag to pan (clamped to the board), a floating **−/100%/+/Ajustar**
  toolbar + double-click to fit. The canvas now draws through a **view transform on a hi-DPI backing store**
  (`devicePixelRatio`), so it stays crisp at any zoom; **pointer events** unify mouse + touch and a press on a
  component still beats panning; zoom resets on board load. **(4) Legibility.** Bolder/larger pin labels,
  larger live pin-state squares, 7-seg now shows faint **ghost (unlit) segments** so the digit shape is always
  readable plus brighter lit segments, and clearer buttons. **(5) Bug fixed:** the live PC highlight used
  `scrollIntoView`, which scrolled the *whole page* — on mobile it yanked the view down to the dock every
  frame; it now scrolls only inside the program pane. **Verified live in Chrome at 1440 / tablet / 390px:**
  mux counter runs, two-pane Depurador live (Programa+Vigilar / +SFR / +Pila), breakpoints + step + inline
  edit, wheel/button/drag zoom + pan + dock-resize + dock toggle, theme + clock + ASM editor intact,
  single-pane + no page-jump on mobile, **zero console errors**. Pure runtime change → no wasm
  rebuild/embed/verify-core needed. *Uncommitted.*

- **2026-06-24 (dock: editor moved into the side panel)** — Follow-up to the revamp above
  (`runtime/index.html` only, no core change). The **right dock now holds two independent, stackable blocks
  — "Depurador" and "Código (ASM)"** — each with its own ✕ and its own **navbar toggle** (the app bar now has
  *Código* and *Depurador* buttons instead of one *Panel* button). Both can be open **at the same time** (they
  split the dock height, each ~half, resizable via the existing edge drag); closing both hides the dock. The ASM
  editor was thus **moved out of the bottom of the stage into this dock**, and its textarea now **fills the block
  height** (the old bottom panel made it cramped). Selecting a demo that carries `.asm` opens the Código block
  (debugger stays as-is). State persists per block (`np_dock`, `np_editor`); defaults: debugger open on desktop,
  editor closed (open it from the navbar). Verified live: both blocks open together, independent toggles + ✕,
  editor full-height + compiles, demo-source auto-opens Código, no console errors. On phones (≤640px) the
  navbar toggles are **icon-only** (button labels + the chip tag are hidden) so the bar isn't cramped.
  Also, the Depurador navbar button now uses a **bug icon** (standard debugger symbol). And on mobile (≤920px)
  the controls reflow **top→down: Placa · Archivos · board · Simulación · status** — done with `.rail{display:contents}`
  so the rail's cards become direct grid items and `grid-template-areas` orders them around the board (desktop rail
  layout unchanged). **Compacted the Simulación card** (helps mobile most): the stopwatch now sits inline with the
  ▶/■ transport (`.sim-row`) and the Hz value sits on the *Reloj* label line (`.clock-line`), removing two stacked
  rows; card ~197px on desktop, shorter on mobile. Added a **"Limpiar" button** to the ASM editor toolbar
  (`#edClear`) that wipes the editor (with a confirm guard) — saves tediously deleting everything by hand on
  mobile; clears the textarea + saved `np_src` and refocuses. The editor toolbar's secondary actions are now
  **icon-only** (`.ebtn`): Abrir = folder, Descargar = download, Limpiar = trash (with tooltips/aria-labels);
  the primary **Compilar y cargar** keeps its text label. *Uncommitted.*

- **2026-06-23 (editor: .asm open/save + example source)** — Editor (`runtime/index.html`) gains **Abrir
  .asm** / **Descargar .asm** (load a local `.asm` into the editor; save the editor to a `programa.asm`
  file via a Blob), and examples can now **carry their source**: a lab with an `asm` field populates the
  editor and opens it when selected, so students see the code behind a demo, not just the hex (loading
  still goes through the existing `hex`, so behaviour is unchanged). Wired the mechanism + attached a
  **verified, readable, commented `.asm` to all four built-in demos** (Parpadeo, 7-seg counter, 2-digit
  mux counter, EEPROM counter). Each was reconstructed from its hardcoded hex with a small PIC14
  disassembler, then hand-cleaned (labels, SFR names, Spanish comments) and confirmed to **re-assemble
  byte-identical** to the original hex — so selecting a demo shows faithful source in the editor that
  round-trips back to the same program. Loading still runs the hex; the `.asm` is editor source. The
  reconstructed sources live as `*_ASM` consts next to the `*_HEX` ones in `runtime/index.html`.
  Also dropped the now-redundant **Cargar ejemplo** button — examples carry their own source now (the
  built-in counter sample still loads into an empty editor on first open). *Uncommitted.*

- **2026-06-23 (board: button-on-output warning)** — New 4th pin-square colour on the chip: **amber =
  a button is wired to a pin the firmware configured as an OUTPUT and it's pressed** — surfaces a
  common beginner mistake (forgetting the button pin needs to stay an input / wrong TRIS) instead of
  the button silently doing nothing. `runtime/index.html` only (canvas draw): `drawChip` now checks the
  pin's TRIS bit plus the wired button's `pressed` flag (button objects carry their `pin`). Verified
  live: Parpadeo board, RA4 forced to output + button held → RA4 square goes amber while its PORTA
  neighbours stay blue. No core/assembler change. *Uncommitted.*

- **2026-06-23 (ASM editor — Phase 2: macros)** — The in-browser assembler now handles the full MPASM
  preprocessor the labs use: **`CBLOCK`/`ENDC`** (auto-incrementing RAM allocation → synthetic EQUs),
  **`#define`** text macros (incl. multi-token values like `PORTB,0` and instruction-valued ones like
  `CLRF PORTA`, substituted recursively), and **`MACRO`/`ENDM`** with parameters (invocations expanded
  with arg substitution; bodies re-preprocessed for nested #defines/macros; a label on the invocation
  line is handled). Added as a preprocessing pass in `runtime/asm.js` (`preprocess` / `expandLine` /
  `applyDefines` / `preParse`) that runs before the existing two passes — no change to encoding or timing.
  `DT`/`DW`/`DE`/`FILL`/`RES` stay out of scope (clean reject). **Validated byte-for-byte against the REAL
  compiler:** ran the installed `MPASMWIN.exe` on all four example labs via `mpe2e/run.bat` and diffed —
  **Punto A 9/9, Multiplicación 10/10, TP-turnos 107/107, and the macro/CBLOCK/#define TP 2022 119/119
  program words + config word, zero diffs, zero extra words.** (Heads-up: `examples/Another large/TP 2022
  - Ejemplo.hex` is a *non-corresponding* revision — 0/119 vs the `.asm` — so `test-asm.js` only checks
  TP 2022 *assembles*; the MPASM diff is the real check. The other 3 `.hex` pairs still match with the
  usual 2 fill-word drift.) `test-asm.js` updated (TP 2022 case reject→assembles). `S:\New Proteus\mpe2e\`
  is throwaway MPASM-comparison scratch (safe to delete / gitignore). *Uncommitted.*

- **2026-06-23 (built-in ASM editor)** — Added an in-browser **"Editor de código (ASM)"** so students
  can write MPASM and compile to a runnable `.hex` on their phone, no MPLAB needed. **New
  `runtime/asm.js`** — a pure-JS two-pass PIC16F628A assembler: all 35 instructions, labels, `EQU`/`SET`,
  `ORG`, `__CONFIG` (numeric + symbolic `_A & _B`), `BANKSEL` (→ bcf/bsf `STATUS,RP0` then `RP1`, 2
  words), `GOTO $`, the `.dec`/`0x`/`h''`/`b''`/`d''`/`'c'` radixes (bare digit-led = hex, MPASM
  default), a built-in p16f628a symbol table (SFRs + bit names + config consts, so `#include` is a
  no-op), and `END`. Emits Intel HEX into the **existing `loadHex()` path unchanged — no core/WASM
  change, the 83 tests and the embed are untouched, no rebuild**. CBLOCK/`#define`/MACRO are out of MVP
  scope and **rejected with a clear Spanish "compilá en MPLAB por ahora"** message rather than
  mis-assembled. `index.html` — a collapsible **Código** panel mirroring the Depurador (monospace
  textarea + "Compilar y cargar"; success → `loadHex`+`afterHex`, runs like a file load; error → `línea
  N: motivo`; source saved in `localStorage` `np_src`; a built-in counter example). `sw.js` — `asm.js`
  added to the precache SHELL, cache **v1→v2** (offline-safe). **Validated by a new Node oracle
  `test-asm.js`** (no Rust): assembles the real `examples/*.asm` and diffs every program word vs the
  matching MPLAB `.hex` — **Punto A, Multiplicación and TP-turnos match byte-for-byte (126 instruction
  words, 0 contradictions)**; the macro/CBLOCK `TP 2022` is rejected cleanly. (TP-turnos's config word
  differs, 0x3F24 vs 0x3F30 — the `.asm`/`.hex` are slightly revision-drifted, also visible as 2 stray
  fill words per file; the config word doesn't affect the sim.) Sample compiles (13 instr, checksums
  OK); editor JS parses. **Range-check fix (Santiago caught it):** out-of-range operands
  now error instead of silently masking — `movlw .20000` → "literal fuera de rango (0-255)",
  plus goto/call (0-0x7FF) and file-register (0-0x1FF, via `fileAddr`) checks; `clrf TRISB`
  (0x86→low 7 bits) still valid, oracle still byte-exact, confirmed live in the browser.
  **Config-constant fix (via the real `p16f628a.inc`, which Santiago attached):** cross-checked
  every symbol table against the authoritative inc — **SFR 35/35 and bit names 74/74 exact**, and
  `__MAXRAM H'1FF'` confirms the file-register ceiling. But my `__CONFIG` table had **PWRTE and WDT on
  the wrong bits** (real chip: PWRTE=bit3 `_PWRTE_ON=0x3FF7`, WDTE=bit2 `_WDT_OFF=0x3FFB`; I'd had them
  one bit off each). Regenerated the whole CFG verbatim from the inc → **TP-turnos's config word is now
  0x3F30, matching MPLAB exactly** (so the example `.hex` was right all along; my constants were the bug,
  not "revision drift"). All three assembled examples now match MPLAB byte-for-byte *including config*.
  **End-to-end confirmation against the real compiler:** ran `MPASMWIN.exe` (installed MPASM Suite) on
  all three sources via `S:\New Proteus\mpe2e\run.bat` and diffed its `.hex` against the in-browser
  output — **byte-for-byte identical on every program word AND the config word** (puntoa 9/9, mult 10/10,
  turnos 107/107; zero diffs, zero extra words). MPASM's only output was `Message[302]` bank reminders.
  (Confirms the 2 stray fill words vs the *old* example `.hex` were source drift — a fresh compile has
  none.) `S:\New Proteus\mpe2e\` is throwaway test scratch, safe to delete.
  *Uncommitted.*

- **2026-06-22 (transport controls)** — Replaced the Ejecutar/Pausar/Reiniciar **text** buttons with
  **media-transport icon controls** in the Simulación card: a **morphing play↔pause toggle** (shows ▶
  when paused/stopped, ⏸ while running; `aria-label`/title swap to match) plus a **Stop** button. The
  **accent highlight is on the ▶ play state** (the primary "press me to run" action); the running/pause
  and Stop states are neutral.
  `runtime/index.html` only (HTML + CSS + control rewiring, **no core change**).
  **Stop = halt + power-cycle reset** (`np_reset`, stopwatch → 0, components idled) — so it both stops
  *and* rewinds, where the old Reiniciar reset but kept running. New `setRunning/play/pause/stop/
  togglePlay` replace the `runBtn`/`resetBtn` toggle; Space now calls `togglePlay`; the two status
  strings that named "Reiniciar" now say "Detener". **Verified live:** auto-run lights play + advances
  cycles; pause freezes cycles; play resumes; stop zeroes cycles + stopwatch; Space toggles play/pause;
  no console errors. **Stop also blanks the *board***, not just the core: each LED/7-seg/button gained a
  `clear()` that zeroes its persisted brightness (`b`) + accumulators, called from `stop()` — so a
  stopped board visibly goes dark and resets, instead of freezing the last lit frame the way Pause does
  (which is what made pause/stop look identical until you pressed play). Verified: a lit display reads
  brightness 6.5 → Pause leaves it 6.5 → Stop drops it to 0. *Uncommitted.*
- **2026-06-22 (security hardening)** — Acted on `SECURITY-REVIEW.md`. Baseline risk was already
  low (static, client-only, no data / secrets / accounts), so this closes the two real items + cheap
  defense-in-depth, **with no core/wasm change — the 83 tests and the embed are untouched, no rebuild
  needed**. `runtime/index.html`: **M1** the status line uses `textContent`, not `innerHTML`, so a
  malicious `.hex` filename or lab name can't run script (the one cross-user vector — an instructor
  opening a student's file); **L1/L4** dropdown names/groups + watch labels escaped via a shared
  `esc()`; **I1** `np_set_pin` is skipped when a pin name is invalid (`pinIndex<0`) so a malformed
  `labs.js` can't trap the sim; **L2** added a `<meta>` CSP (`default-src 'none'; connect-src 'self';
  object-src 'none'; base-uri 'none'; …`) — `script-src` keeps `'wasm-unsafe-eval'` so the embedded
  WASM still instantiates. `runtime/authoring.html`: **L5** the editor card escapes its label/type
  interpolations (self-XSS on JSON import). `serve.js`: **M2** `/__save_labs` now requires a custom
  `X-SimuPIC` header (a cross-origin page sending it would trigger a CORS preflight we never answer)
  plus a same-origin `Sec-Fetch-Site`, and the path-prefix check is tightened — closes the dev-box
  CSRF; `authoring.html` sends the header (**restart `serve.js` for this to take effect**). **Verified
  live** (reloaded the open tab): core loads, sim runs (cycles advance, PORTB updates, stopwatch
  ticks), SW registers, dropdown populates — **zero console errors / no CSP violations** — and a
  direct test confirmed an injected `<img onerror>` through the status line renders as inert text.
  Deliberately skipped as higher-effort / low-value: the full `script-src 'self'` refactor (would
  break the single self-contained `index.html`) and the Moodle-iframe `sandbox`. *Uncommitted.*
- **2026-06-18 (stack view)** — Added the debugger's **"Pila" view** — the PIC's 8-level CALL/RETURN
  hardware stack, showing depth + the return address at each level (top marked). Needs a **core
  change** (the stack isn't memory-mapped): `Cpu::stack_depth`/`stack_at` → `Core` → WASM
  `np_stack_depth`/`np_stack_at` (`core/src/{cpu,lib,wasm}.rs`), a `stack_view_surface` unit test
  (→ 83 tests), and a `verify-core.js` part (C). Runtime `index.html` has the Pila tab/view; it
  degrades to a "recompilá el núcleo" note on an old core. **Done: rebuilt + embedded (59,884-byte
  wasm); `verify-core.js` all ✓ incl. `stack surface … ✓`; 83 tests green; verified live in-browser
  — a CALL shows depth 0→1, level 0 = 0x001, top marked.** *Uncommitted.*
- **2026-06-18 (persistence of vision)** — Reworked 7-seg brightness to model **honest persistence
  of vision** (`runtime/index.html`). Each segment decays toward 0 with a ~45 ms time constant (the
  eye's persistence) and is pulled to full while *actually lit* (its digit selected AND the segment
  driven). So a mux faster than flicker-fusion fuses to a **solid, bright** display, while a mux
  slower than the eye **visibly flickers** — like real hardware, and deliberately *unlike* Proteus,
  which hides a slow refresh. Time-based → frame-rate-agnostic. **Design call (Santiago): keep the
  sim realistic rather than paper over slow firmware** — students should see and fix a too-slow
  refresh. The TP-Dificil example refreshes each digit only ~17 Hz → now flickers (segment ripple
  0.51, peaks at full brightness); a kHz-range refresh shows solid. (First tried a latch-and-hold
  that forced everything solid — reverted in favour of realism.) **The decision and its one known
  limitation — the flicker threshold is tied to the monitor's refresh rate (~8–17 ms-cycle mux can
  look solid at 60 Hz but flicker at 120 Hz), with the fix-if-needed — are documented in
  `docs/architecture.md` §4.1.** *Uncommitted.*
- **2026-06-18 (timing fix)** — Fixed the sim running **too fast on high-refresh displays**. The
  frame loop assumed 60 fps (`cycleBudget += clockHz/4/60`), so on a 120 Hz screen it ran 2× real
  speed (measured ratio 2.00). Now the budget is driven by **real elapsed time** (`clockHz/4 × dt`,
  the same `dt` the stopwatch uses, capped at 100 ms), so a "4 MHz" program runs at true 4 MHz
  wall-clock on any display (re-measured ratio 1.00; simulated time now equals the stopwatch).
  `runtime/index.html` only. *Uncommitted.*
- **2026-06-18 (runtime QoL)** — Four small conveniences (`runtime/index.html` only): a **clock
  slider** (1-2-5 steps, 1 Hz–8 MHz) synced two-way with the Reloj text input (quick way to slow
  things down to watch a multiplex cycle); an always-visible **real wall-clock stopwatch**
  (mm:ss:ms) in the Simulación card — it counts real seconds the sim has run, **independent of the
  PIC clock** (the slider doesn't change it; cycle count stays in the debugger), pauses with the
  run, and resets on load / Reiniciar; **drag-and-drop a `.hex`** onto the board to load it; and **space =
  Ejecutar/Pausar**. Verified slider, readout, drag highlight, and spacebar — the apparent "freeze"
  during headless testing was just the backgrounded tab pausing `requestAnimationFrame` (`frame()`
  steps cleanly, no error). *Uncommitted.* The **hardware stack view** (needs a core export + wasm
  rebuild) is still pending.
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
  in the app bar (persisted in `localStorage` `np_theme`, no-flash inline head script; **new
  users default to light**, a saved toggle is respected); a **restructured layout** — top app bar (brand + theme
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
  highlight, data-memory grid (bank 0/1), named SFRs with bit breakdowns, the 8-level
  hardware call stack (*Pila*), breakpoints + live memory editing, and a watch/filter (by
  address or register name, persisted in `localStorage`). Cycle-exact.
- **EEPROM** (EECON1/EECON2 unlock; persists across reset/power-cycle). Demo
  climbs 1→2→3 across the Reset (power-cycle) button. (step 5)
- **Authoring tool** (`runtime/authoring.html`, instructor-only): visual editor —
  add LED/button/7-seg, assign pins (per-segment for 7-seg), button polarity +
  labels, live preview, export/import JSON. Round-trips to the student runtime.
- **Built-in ASM editor** (`runtime/asm.js` + the **Código** panel): pure-JS PIC16F628A
  assembler — write MPASM, compile to a runnable `.hex` in the browser/phone, no MPLAB. 35
  instructions, labels, `EQU`/`ORG`/`__CONFIG`/`BANKSEL`, all radixes, built-in p16f628a symbols;
  emits Intel HEX into the existing `loadHex()` (no core change). CBLOCK/`#define`/MACRO → clean
  Spanish "use MPLAB" rejection. Validated byte-for-byte vs MPLAB (`node test-asm.js`).
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

- ASM editor **Phase 2** (optional): `CBLOCK`/`ENDC`, `#define` text macros, and `MACRO`/`ENDM` so the
  macro/cblock labs (e.g. the multiplexed `TP 2022`) assemble in-browser too — today they're rejected
  with a "usá MPLAB" note. The macro processor is the long pole; everything else is additive and still
  needs no core change. `test-asm.js` already has those two files as fixtures.

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
