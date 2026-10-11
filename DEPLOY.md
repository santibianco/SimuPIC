# Deploying New Proteus to your students

The student app is the `runtime/` folder — a fully static site (one HTML page
plus the embedded WASM core, ~100 KB total). Hosting it is free and gives every
student a URL that works on any laptop or phone, installs as an app, and runs
offline after the first visit.

## Renaming the repo (picsim → SimuPIC)

The project was first pushed as **picsim**; it's now **SimuPIC**. If your repo
still lives under the old name, rename it once — GitHub auto-redirects the old
URLs, so existing links and the Moodle iframe keep working until you update them.

1. On GitHub: **repo → Settings → General**, then rename **picsim → SimuPIC**.
2. Point your local clone at the new URL:

   ```sh
   git remote set-url origin https://github.com/santibianco/SimuPIC.git
   git remote -v   # confirm it now shows SimuPIC
   ```

3. Push as usual. Your live URL becomes
   <https://santibianco.github.io/SimuPIC/> (Settings → Pages shows the exact link).

## One-time setup (GitHub Pages)

You're comfortable with git, so this is the lightest path: push the repo once,
and a GitHub Action republishes the app automatically on every later push.

1. **Initialize git and push** from the project root (your `SimuPIC` repo already
   exists on GitHub):

   ```sh
   git init
   git add -A
   git commit -m "SimuPIC: cycle-accurate PIC16F628A simulator"
   git branch -M main
   git remote add origin https://github.com/santibianco/SimuPIC.git
   git push -u origin main
   ```

   A bundled `.gitignore` keeps Rust's ~68 MB `core/target/` build cache out of git.

2. **Enable Pages**: repo → **Settings → Pages** → under *Build and deployment*,
   set **Source = GitHub Actions**.

3. The bundled workflow (`.github/workflows/pages.yml`) runs on each push to
   `main`. Watch it under the **Actions** tab; when it goes green your URL is:

   ```
   https://santibianco.github.io/SimuPIC/
   ```

   (Settings → Pages shows the exact link.)

Share that URL with students — done. The workflow publishes `runtime/` **without**
`authoring.html`, so your instructor editor never reaches the public site.

> **If your first push failed** with *"Get Pages site failed… verify that the repository
> has Pages enabled"*, it simply ran before you set the Source above. Re-run it: the
> **Actions** tab → open the failed run → **Re-run all jobs** (or push any new commit).
> It succeeds once Pages is enabled.

## Updating the app

Anything you change under `runtime/` (a new bundled lab diagram, a UI tweak) goes
live by pushing:

```sh
git add -A && git commit -m "update" && git push
```

If you rebuilt the WASM core, re-embed it first (see `STATUS.md` step 3), then push.

## Embedding in Moodle

Because it's a normal HTTPS URL, the simulator drops straight into a course:

1. In the course, **Turn editing on → Add an activity or resource → Page**
   (or edit any Label / HTML block).
2. In the editor click the **`< >`** (HTML) button and paste:

   ```html
   <iframe src="https://santibianco.github.io/SimuPIC/"
           width="960" height="700" style="max-width:100%;border:0"
           allow="fullscreen"></iframe>
   ```

3. Save. Students use the simulator inline, inside the course page.

Notes:

- It must be **https** (Pages is) — Moodle blocks http iframes.
- If your Moodle locks down the editor and strips iframes, paste the URL as a
  plain link instead — it opens the full app in a new tab.
- **Install / offline works from the direct URL, not from inside the iframe**
  (browsers restrict installation in frames). So point students at the URL for the
  installable, offline-capable app; treat the Moodle iframe as a convenience.

## Install + offline (PWA)

On the direct URL the browser offers **Install** (an icon in the address bar, or
"Add to Home Screen" on phones). Once installed it opens in its own window with an
icon and runs **fully offline** — the whole app is cached on first visit. Good for
students at home with flaky internet, or a lab with none.

## Usage statistics (GoatCounter)

The page reports anonymous usage to [GoatCounter](https://www.goatcounter.com) — an
open-source, cookie-free counter, free for non-commercial use. Dashboard:
<https://simupic.goatcounter.com> (log in with the account created at
<https://www.goatcounter.com/signup>; the *code* chosen there is the subdomain).

What it records: page views and unique visits (a rotating hash per session — no cookies,
no IPs stored), referrer (so Moodle vs. direct links show up), country, browser and screen
size. Plus a few **events**, so you can see how the simulator is actually used:

Counted **every time** they happen (activity volume):

| Event (path in the dashboard) | Fired when |
|---|---|
| `compilar` / `compilar-error` | the *Código* editor assembles a program and loads it / the assembler rejects it |
| `editor/cargar-asm` (title `archivo` / `arrastrar`) | an `.asm` file is opened into the editor (folder button / dropped on the page) |
| `placa/<name>` (title `placa` / `ejemplo`) | a board or example is picked from the *Placa* dropdown |

Counted **once per page load** (`trackOnce()`), so the total ≈ *how many sessions used that
part of the app* — read them next to the page views to see which parts students actually use:

| Event | Fired the first time in a session that… |
|---|---|
| `debugger/abrir` | the student opens the Debugger with the toolbar button (the default-open debugger on wide screens doesn't count). (`editor/abrir` existed until 2026-10-11, when the Código editor became always open.) |
| `debugger/paso`, `debugger/paso-10` | *Paso* / *×10* is pressed |
| `debugger/pausa` | execution is paused |
| `debugger/breakpoint` | a breakpoint is set in the *Programa* view |
| `debugger/breakpoint-editor` | a breakpoint is toggled in the code editor's gutter |
| `debugger/vista/<view>` (`prog`, `data`, `sfr`, `stack`, `watch`) | a pane is switched to that view |
| `debugger/watch` | a watch is added |
| `debugger/editar-memoria` | a memory cell or register is edited inline |
| `ayuda/manual`, `ayuda/instrucciones` | the manual drawer / instruction-set table is opened |

Nothing about the program itself (source, file name, assembler message) is ever sent.
Loading a program already starts it running, so there is no separate "run" event — it would be
the same number as `compilar`. (`cargar-hex` existed until 2026-10-11, when the `.hex` upload was
removed; old data for it stays in the dashboard. Comparing `debugger/breakpoint` with
`debugger/breakpoint-editor` shows whether the *Programa* view is still worth keeping.)

`#toggle-goatcounter` (below) switches off **all** of it in that browser — page views and
events alike: every hit goes through the same `goatcounter.count()` filter.

How it's wired (all in `runtime/`):

- `count.js` — a local copy of GoatCounter's script (ISC licence), served from the same
  origin so the CSP in `index.html` doesn't have to allow external scripts. The only local
  change is a `try/catch` around `localStorage` (see the header comment).
- `index.html` — the `<script data-goatcounter=…>` tag (with `allow_frame`, otherwise
  nothing inside the Moodle iframe would be counted), the `track()` helper next to
  `loadProgram()`, and the CSP `connect-src` / `img-src` entries for `https://simupic.goatcounter.com`.
- `sw.js` — the service worker ignores cross-origin requests, so beacons are never cached.

**Changing the site code:** replace `simupic.goatcounter.com` in `runtime/index.html`
(the script tag and the two CSP entries — three occurrences) and in this file.

Good to know:

- `localhost` and `file://` visits are not counted, so dev sessions stay out.
- To exclude your own browser on the live site, open
  <https://santibianco.github.io/SimuPIC/#toggle-goatcounter> once (it sets a flag in that
  browser's localStorage; open it again to re-enable).
- Ad blockers drop some hits — treat the numbers as a floor, not a ceiling.
- Cookie-free, anonymous counting doesn't call for a consent banner.

## Alternative: your own / university server

The app is plain static files. To use other hosting, copy the contents of
`runtime/` (minus `authoring.html`) to any web server that serves over **https**.
No build step, no backend.
