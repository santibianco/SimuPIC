// SimuPIC — generate runtime/help.js (the in-app manual) from docs/manual.md.
//
// docs/manual.md is the single source of truth for the user manual: edit it,
// run `node build-help.js`, commit the regenerated runtime/help.js. The page
// itself has no build step, so the manual ships as plain data + HTML strings,
// exactly like the base64 core.
//
// Markdown subset supported (all the manual uses): ## / ### / #### headings,
// paragraphs, "- " lists, pipe tables, "> " callouts, **bold**, `code`,
// <autolinks>, and <!-- figura n --> markers (dropped — the app IS the figure).
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "docs", "manual.md");
const OUT = path.join(__dirname, "runtime", "help.js");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// inline: **bold**, `code`, <url>
function inline(s) {
  let h = esc(s);
  h = h.replace(/`([^`]+)`/g, (m, c) => `<code>${c}</code>`);
  h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  return h;
}

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function render(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim() || /^<!--/.test(l)) { i++; continue; }

    if (/^####\s/.test(l)) { out.push(`<h4>${inline(l.slice(5).trim())}</h4>`); i++; continue; }
    if (/^###\s/.test(l))  { out.push(`<h3 id="h-${slug(l.slice(4))}">${inline(l.slice(4).trim())}</h3>`); i++; continue; }

    if (/^\|/.test(l)) {                                   // table
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        const cells = lines[i].slice(1).replace(/\|\s*$/, "").split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
        if (!/^[\s|:-]+$/.test(lines[i])) rows.push(cells);
        i++;
      }
      if (rows.length) {
        const head = rows[0], body = rows.slice(1);
        out.push('<div class="htableWrap"><table class="htable">');
        out.push("<thead><tr>" + head.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead>");
        out.push("<tbody>" + body.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") + "</tbody>");
        out.push("</table></div>");
      }
      continue;
    }

    if (/^>\s?/.test(l)) {                                  // callout
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      const paras = buf.join("\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      let title = "";
      if (paras.length && /^\*\*[^*]+\*\*$/.test(paras[0].trim())) title = paras.shift().replace(/\*\*/g, "");
      out.push('<aside class="hnote">' + (title ? `<div class="hnoteT">${esc(title)}</div>` : "") +
        paras.map((p) => `<p>${inline(p)}</p>`).join("") + "</aside>");
      continue;
    }

    if (/^-\s/.test(l)) {                                   // list
      const items = [];
      while (i < lines.length && /^-\s/.test(lines[i])) { items.push(lines[i].slice(2).trim()); i++; }
      out.push("<ul>" + items.map((t) => `<li>${inline(t)}</li>`).join("") + "</ul>");
      continue;
    }

    const buf = [];                                          // paragraph
    while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|\||>|-\s|<!--)/.test(lines[i])) { buf.push(lines[i].trim()); i++; }
    if (buf.length) out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

const md = fs.readFileSync(SRC, "utf8").split(/\r?\n/);
const sections = [];
let intro = [], cur = null;

for (const line of md) {
  if (/^#\s/.test(line)) continue;                           // document title
  if (/^##\s/.test(line)) {
    const raw = line.slice(3).trim();
    const m = /^(\d+)\.\s*(.+)$/.exec(raw);
    cur = { n: m ? m[1] : "", t: m ? m[2] : raw, id: "s-" + slug(raw), lines: [] };
    sections.push(cur);
    continue;
  }
  (cur ? cur.lines : intro).push(line);
}

const built = sections.map((s) => {
  const h = render(s.lines);
  const subs = s.lines.filter((l) => /^###\s/.test(l)).map((l) => {
    const t = l.slice(4).trim();
    return { id: "h-" + slug(t), t };
  });
  return { id: s.id, n: s.n, t: s.t, h, subs };   // el texto para buscar se deriva del HTML al cargar
});

const banner = `/* SimuPIC — in-app user manual. GENERATED FILE — DO NOT EDIT.
 * Source: docs/manual.md · rebuild with: node build-help.js
 * ${built.length} sections, generated ${new Date().toISOString().slice(0, 10)}.
 */\n`;

const body = `(function (root) {
  const HELP = {
    source: "docs/manual.md",
    intro: ${JSON.stringify(render(intro))},
    sections: ${JSON.stringify(built, null, 1)}
  };
  if (typeof module === "object" && module.exports) module.exports = HELP;
  root.NP_HELP = HELP;
})(typeof globalThis !== "undefined" ? globalThis : this);\n`;

fs.writeFileSync(OUT, banner + body);
console.log(`✓ runtime/help.js — ${built.length} secciones, ${(banner + body).length} bytes`);
