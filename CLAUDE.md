# SimuPIC — start here (agent onboarding)

**Read this, then `STATUS.md`, and you're caught up.** This is an ongoing classroom
project, not a fresh codebase — most of it is already built, tested, and deployed.

## What it is
A browser-based, OS-agnostic, **cycle-accurate PIC16F628A simulator** for a university
course in Argentina. Students write MPASM in the built-in editor, compile it in the browser
against an instructor's board, watch it run and debug it on the source. Live on GitHub Pages;
embeddable in Moodle.

> **Name:** SimuPIC. The folder is still `New Proteus` and a few app strings may still say
> `picsim` — the rename is in progress, so prefer "SimuPIC" in new work.

## The one non-negotiable: cycle-accuracy
This exists because SimulIDE's timing is wrong and breaks multiplexing + debounce labs.
The core counts instruction cycles exactly (1 cycle/instruction, 2 for taken branches;
1 cycle = 4 clocks). **The render loop samples time; it never drives it.** Anything you
touch near timing must keep the **82 tests** green. Spec: `docs/architecture.md`.

## Scope is deliberately narrow — don't expand it without asking Santiago
PIC16F628A only · digital I/O only · components = LEDs / 7-seg / buttons only. No analog,
no other chips. Programs get in **only** through the in-browser assembler (`runtime/asm.js`)
and the Código editor — the `.hex` upload was removed on 2026-10-11, and so was the clock
control (always 4 MHz; `clock` in labs.js is an instructor-only override). The assembler
deliberately rejects DT/DE/DW/DA/FILL/RES (the course writes RETLW tables).

## Working conventions (hard-won — don't relearn these)
- **Santiago builds the WASM on Windows (Rust). The agent can't run Rust/cargo here** — it
  does the base64 embed + file work, and asks Santiago to run `cargo test` / the build.
- **WASM gotcha:** `cargo rustc --crate-type cdylib` writes the `.wasm` to
  `core/target/wasm32-unknown-unknown/release/DEPS/`, *not* the top-level `release/`.
  Embed from `deps/`, then run `node verify-core.js` (must print ✓ — it catches a stale
  or wrong embed). Exact commands in `STATUS.md`.
- **No Python — use Node** for tooling.
- Student UI is **Spanish (es-AR)**; Santiago talks to the agent in **English**. Keep UI
  strings Spanish, code/docs English.
- The runtime is one self-contained `runtime/index.html` + a base64-embedded core
  (`core-wasm.js`). No build step for the page; `node serve.js` → http://localhost:8080.

## Map
- `core/` — Rust→WASM core (cpu, decode, memory, timer, interrupts, scheduler, sampler,
  hex, wasm).
- `runtime/` — the app: `index.html`, `core-wasm.js`, `labs.js` (instructor boards → the
  "Placa" dropdown), `asm.js` (assembler + line map), `editor.js` (gutter, highlighting,
  debugger marks), PWA files, `authoring.html` (instructor diagram editor, not deployed).
  Tests without Rust: `node test-asm.js`, `node test-isa.js`.
- `STATUS.md` — live status + build/test/run + what's pending. **Keep it current.**
- `README.md` / `docs/architecture.md` / `DEPLOY.md` — overview / spec / hosting + Moodle.

## To resume a session
1. Read `STATUS.md` (state + the session log at the top).
2. If you'll touch the core, ask Santiago to confirm `cargo test` is green (82 tests).
3. Make changes → verify in the browser → **add a dated entry to the STATUS.md session
   log** before you finish.

---
*Santiago — to bootstrap a fresh chat, paste this:*
> Continuing **SimuPIC** in this folder. Read `CLAUDE.md` and `STATUS.md`, then give me a
> 3-line summary of where things stand and what's pending — don't change anything yet.
