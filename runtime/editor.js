// SimuPIC — code-editor enhancements: line-number gutter + MPASM syntax highlighting.
//
// Self-contained, dependency-free, same-origin (so it's CSP-safe under the page's
// `default-src 'none'; script-src 'self' …` policy and works offline via the service worker,
// exactly like asm.js / labs.js). No core/WASM involvement.
//
// Technique — the classic "highlight layer behind a transparent textarea":
//   • a <pre class="edHl"><code> renders the source with coloured tokens;
//   • the real <textarea id="edSrc"> sits on top with transparent text but a visible caret,
//     so the colours beneath show through while editing stays 100% native (selection, undo,
//     IME, mobile keyboards — all the textarea's own);
//   • the two are kept in lock-step on scroll, and a gutter column renders one number per line.
//
// Keyword tables are taken from asm.js (window.NP_ASM) when it loaded, so the highlighter always
// agrees with what actually assembles; a baked-in fallback keeps colours working if asm.js failed.
(function (global) {
  "use strict";

  // ---- token-classification tables (keys are UPPERCASE) ----
  var FALLBACK_MNEM = ("ADDWF ANDWF CLRF CLRW COMF DECF DECFSZ INCF INCFSZ IORWF MOVF MOVWF NOP " +
    "RLF RRF SUBWF SWAPF XORWF BCF BSF BTFSC BTFSS ADDLW ANDLW CALL CLRWDT GOTO IORLW MOVLW " +
    "RETFIE RETLW RETURN SLEEP SUBLW XORLW").split(" ");

  var DIRECTIVES = ("ORG END EQU SET __CONFIG CONFIG CBLOCK ENDC MACRO ENDM LOCAL BANKSEL BANKISEL " +
    "PAGESEL __IDLOCS __MAXRAM __BADRAM RADIX LIST NOLIST PROCESSOR INCLUDE RES DT DW DE DA DB FILL " +
    "VARIABLE CONSTANT EXTERN GLOBAL UDATA UDATA_SHR UDATA_OVR IDATA CODE TITLE SUBTITLE PAGE SPACE " +
    "MESSG ERROR ERRORLEVEL").split(" ");

  var FALLBACK_REG = ("INDF TMR0 PCL STATUS FSR PORTA PORTB PCLATH INTCON PIR1 TMR1L TMR1H T1CON " +
    "TMR2 T2CON CCPR1L CCPR1H CCP1CON RCSTA TXREG RCREG CMCON OPTION_REG OPTION TRISA TRISB PIE1 " +
    "PCON PR2 TXSTA SPBRG EEDATA EEADR EECON1 EECON2 VRCON W F").split(" ");

  function toSet(arr) { var s = Object.create(null); for (var i = 0; i < arr.length; i++) s[arr[i]] = 1; return s; }
  function keysUpper(obj) { var o = []; if (obj) for (var k in obj) o.push(k.toUpperCase()); return o; }

  var A = global.NP_ASM;
  var MNEM = toSet(A && A.OPS ? keysUpper(A.OPS) : FALLBACK_MNEM);
  var DIR = toSet(DIRECTIVES);
  var REG = toSet(FALLBACK_REG.concat(
    A ? keysUpper(A.SFR).concat(keysUpper(A.BIT)).concat(keysUpper(A.CFG)) : []));
  REG["W"] = 1; REG["F"] = 1;                          // destination operands are always registers

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function span(cls, text) { return '<span class="tk-' + cls + '">' + esc(text) + "</span>"; }

  // Split a physical line into {code, comment}: a ';' outside a "…"/'…' literal starts a comment.
  function splitComment(s) {
    var inS = false, inC = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '"' && !inC) inS = !inS;
      else if (c === "'" && !inS) inC = !inC;
      else if (c === ";" && !inS && !inC) return { code: s.slice(0, i), comment: s.slice(i) };
    }
    return { code: s, comment: null };
  }

  // One master regex; the matched group tells us the token kind. Order matters — the radix and
  // hex number forms must come before the identifier rule (H'1F', B'1010' start with a letter).
  var TOKEN = new RegExp([
    "(\\s+)",                              //  1 whitespace (kept verbatim so columns stay aligned)
    '("(?:[^"\\\\]|\\\\.)*"?)',            //  2 string
    "([HhBbOoDdQq]'[^']*')",              //  3 radix number   H'1F'  B'1010'  D'20'  O'17'
    "('(?:[^'\\\\]|\\\\.)?'?)",           //  4 char literal   'A'
    "(0[xX][0-9A-Fa-f]+)",                //  5 hex            0x1F
    "(\\.[0-9]+)",                         //  6 decimal        .20
    "([0-9][0-9A-Fa-f]*[HhOoBbDd]?)",     //  7 bare number    20, 1Fh, 1010b
    "(#?[A-Za-z_][A-Za-z0-9_]*)",         //  8 identifier / #directive
    "(\\$[0-9A-Fa-f]*)",                  //  9 location counter $
    "([\\s\\S])"                          // 10 any other single char (operators, commas, …)
  ].join("|"), "g");

  function classifyIdent(tok) {
    if (tok.charAt(0) === "#") return "dir";
    var up = tok.toUpperCase();
    if (up in MNEM) return "key";
    if (up in DIR) return "dir";
    if (up in REG) return "reg";
    return null;                                        // plain symbol / label reference
  }

  function tokenizeCode(code) {
    var html = "", m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(code))) {
      if (m[1] != null) html += esc(m[1]);              // whitespace
      else if (m[2] != null) html += span("str", m[2]);
      else if (m[3] != null) html += span("num", m[3]);
      else if (m[4] != null) html += span("num", m[4]); // char literal → number-coloured
      else if (m[5] != null) html += span("num", m[5]);
      else if (m[6] != null) html += span("num", m[6]);
      else if (m[7] != null) html += span("num", m[7]);
      else if (m[8] != null) { var cls = classifyIdent(m[8]); html += cls ? span(cls, m[8]) : esc(m[8]); }
      else if (m[9] != null) html += span("num", m[9]);
      else html += esc(m[0]);
      if (TOKEN.lastIndex === m.index) TOKEN.lastIndex++; // paranoia: never loop on a zero-width match
    }
    return html;
  }

  function hlLine(line) {
    if (line === "") return "";
    var parts = splitComment(line), code = parts.code, comment = parts.comment, html = "", rest = code;
    // A column-1 identifier (no leading whitespace) that isn't a mnemonic/directive is a label.
    if (!/^\s/.test(code)) {
      var m = /^([A-Za-z_][A-Za-z0-9_]*)(:?)/.exec(code);
      if (m) {
        var up = m[1].toUpperCase();
        if (!(up in MNEM) && !(up in DIR)) { html += span("label", m[1] + m[2]); rest = code.slice(m[0].length); }
      }
    }
    html += tokenizeCode(rest);
    if (comment != null) html += span("comment", comment);
    return html;
  }

  function highlight(src) {
    var lines = src.split("\n"), out = "";
    for (var i = 0; i < lines.length; i++) { out += hlLine(lines[i]); if (i < lines.length - 1) out += "\n"; }
    return out;
  }

  // ---- DOM wiring ----
  var ta, gutter, hlEl, hlCode, lastLines = -1;

  function renderGutter(src) {
    var n = 1; for (var i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) n++;
    if (n === lastLines) return;                        // only rebuild when the line count changes
    lastLines = n;
    var s = ""; for (var k = 1; k <= n; k++) { s += k; if (k < n) s += "\n"; }
    gutter.textContent = s;
  }

  function sync() {
    if (!ta) return;
    hlEl.scrollTop = ta.scrollTop;
    hlEl.scrollLeft = ta.scrollLeft;
    gutter.scrollTop = ta.scrollTop;
  }

  function refresh() {
    if (!ta) return;
    var src = ta.value;
    hlCode.innerHTML = highlight(src);
    renderGutter(src);
    sync();
  }

  function init() {
    ta = document.getElementById("edSrc");
    gutter = document.getElementById("edGutter");
    hlEl = document.getElementById("edHl");
    if (!ta || !gutter || !hlEl) return;
    hlCode = hlEl.firstElementChild || hlEl;
    ta.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    refresh();                                          // runs at DOMContentLoaded, after the inline
  }                                                     // script has populated the textarea

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Public API. The host (index.html) calls refresh() whenever it changes the textarea's content —
  // typing and every programmatic edit funnel through edSave(), which calls this. Scrolling and the
  // initial render are handled here.
  global.NP_EDITOR = { refresh: refresh, highlight: highlight };
})(typeof window !== "undefined" ? window : this);
