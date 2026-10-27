// Extracts the saved Framer page ("Product Designer.html") into data the Next.js app renders verbatim.
// Output: content/head-styles.json, content/body.json, and assets copied into public/assets.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcHtml = path.join(root, "Product Designer.html");
const srcAssets = path.join(root, "Product Designer_files");
const outContent = path.join(root, "content");
const outAssets = path.join(root, "public", "assets");

// Path the browser used when saving the page, and where the main bundle's relative imports originally lived.
const SAVED_PREFIX = "./Dharmesh Nayak - Product Designer_files/";
const FRAMER_SITE_BASE = "https://framerusercontent.com/sites/1CUEc2eQymqbKBrKCLFbQs/";

// Saved files that belong to the browser/Framer tooling rather than the site.
const SKIP_ASSETS = new Set(["edit.html", "editorbar.6DWELBWK.mjs", "script"]);
const SKIP_ASSET_PREFIXES = ["bootstrap."];

const html = fs.readFileSync(srcHtml, "utf8");
const headEnd = html.indexOf("</head>");
const head = html.slice(0, headEnd);

// The body ends at the Framer "bodyEnd" marker; anything after it was injected by a browser extension.
const bodyStart = html.indexOf(">", html.indexOf("<body")) + 1;
const bodyEnd = html.indexOf("<!-- Start of bodyEnd -->");
const body = html.slice(bodyStart, bodyEnd);

const rewritePaths = (s) => s.split(SAVED_PREFIX).join("/assets/");

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function parseAttrs(raw) {
  const attrs = {};
  for (const m of raw.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) {
    attrs[m[1]] = m[2] === undefined ? true : rewritePaths(decode(m[2]));
  }
  return attrs;
}

// <head> styles, in order, with their data attributes (the Framer runtime looks these up).
const headStyles = [...head.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/g)].map((m) => ({
  attrs: parseAttrs(m[1]),
  css: m[2],
}));

// <body> as an ordered list of HTML chunks, scripts and links.
const bodyNodes = [];
let last = 0;
const pushHtml = (chunk) => {
  const cleaned = chunk.replace(/<!--[\s\S]*?-->/g, "").trim();
  if (cleaned) bodyNodes.push({ type: "html", html: rewritePaths(cleaned) });
};
for (const m of body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>|<link\b([^>]*)>/g)) {
  pushHtml(body.slice(last, m.index));
  last = m.index + m[0].length;
  if (m[3] !== undefined) {
    bodyNodes.push({ type: "link", attrs: parseAttrs(m[3]) });
    continue;
  }
  const attrs = parseAttrs(m[1]);
  // Framer's hosted analytics beacon only works on the Framer-hosted domain.
  if (attrs["data-fid"]) continue;
  if (attrs.src === "/assets/script_main.y_XDo5-r.mjs") attrs.src = "/assets/script_main.mjs";
  bodyNodes.push({ type: "script", attrs, code: m[2] });
}
pushHtml(body.slice(last));

fs.mkdirSync(outContent, { recursive: true });
fs.writeFileSync(path.join(outContent, "head-styles.json"), JSON.stringify(headStyles));
fs.writeFileSync(path.join(outContent, "body.json"), JSON.stringify(bodyNodes));

fs.mkdirSync(outAssets, { recursive: true });
for (const name of fs.readdirSync(srcAssets)) {
  if (SKIP_ASSETS.has(name) || SKIP_ASSET_PREFIXES.some((p) => name.startsWith(p))) continue;
  if (name === "script_main.y_XDo5-r.mjs") {
    // The bundle imports its siblings relatively; point those at the Framer CDN they were served from.
    const code = fs
      .readFileSync(path.join(srcAssets, name), "utf8")
      .replace(/(["`])\.\//g, `$1${FRAMER_SITE_BASE}`);
    fs.writeFileSync(path.join(outAssets, "script_main.mjs"), code);
    continue;
  }
  fs.copyFileSync(path.join(srcAssets, name), path.join(outAssets, name));
}

console.log(`head styles: ${headStyles.length}, body nodes: ${bodyNodes.length}`);
for (const n of bodyNodes) console.log(" ", n.type, n.type === "html" ? n.html.length : JSON.stringify(n.attrs).slice(0, 120));
