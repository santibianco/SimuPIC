// Minimal static server for the New Proteus runtime.
// Run from the project root:  node serve.js
// Then open http://localhost:8080  (serves the runtime/ folder).
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "runtime");
const PORT = 8080;
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".css": "text/css",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    // Authoring tool can overwrite runtime/labs.js directly (localhost only).
    if (req.method === "POST" && rel === "/__save_labs") {
      const ra = req.socket.remoteAddress || "";
      if (!/^(::1|127\.|::ffff:127\.)/.test(ra)) { res.statusCode = 403; return res.end("forbidden"); }
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => fs.writeFile(path.join(ROOT, "labs.js"), body, (err) => {
        if (err) { res.statusCode = 500; return res.end(String(err)); }
        res.end("ok");
      }));
      return;
    }
    if (rel === "/") rel = "/index.html";
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) {
      res.statusCode = 403;
      return res.end("forbidden");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.statusCode = 404;
        return res.end("not found");
      }
      res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`New Proteus runtime: http://localhost:${PORT}`));
