// Writes lib/pages/lastmod.json: the date each page's content last changed,
// worked out from git history. The sitemap reads it, so Google sees real
// "last changed" dates instead of today's date on every page.
//
// Run after editing page content, before committing:  npm run lastmod
// Uncommitted changes count as today.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 << 20 });
const today = new Date().toISOString().slice(0, 10);
const out = {};

// Ported pages and blog posts: walk every committed version of the content
// files and note the date each page's entry last changed.
const FILES = ["lib/pages/pages.json", "lib/pages/seo-index.json"];
const commits = git("log", "--reverse", "--format=%H %cs", "--", ...FILES)
  .trim()
  .split("\n")
  .map((l) => l.split(" "));
const seen = {};
const record = (path, sig, date) => {
  if (seen[path] !== sig) {
    seen[path] = sig;
    out[path] = date;
  }
};
const entries = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
};
const signatures = (read) => {
  const sig = {};
  for (const f of FILES)
    for (const it of entries(read(f)))
      sig[`/${it.slug}`] = (sig[`/${it.slug}`] ?? "") + JSON.stringify(it);
  return sig;
};
for (const [hash, date] of commits) {
  const sig = signatures((f) => {
    try {
      return git("show", `${hash}:${f}`);
    } catch {
      return "[]";
    }
  });
  for (const [path, s] of Object.entries(sig)) record(path, s, date);
}
for (const [path, s] of Object.entries(signatures((f) => readFileSync(f, "utf8"))))
  record(path, s, today);

// Hand-built pages: the newest change to the files that render them.
const CORE = {
  "/": ["lib/content/en.ts", "components/HomePage.tsx", "components/sections", "lib/admin/defaults.ts"],
  "/es": ["lib/content/es.ts", "components/HomePage.tsx", "components/sections", "lib/admin/defaults.ts"],
  "/contact": ["lib/content/en.ts", "components/ContactPage.tsx", "components/ui/ContactForm.tsx"],
  "/es/contact": ["lib/content/es.ts", "components/ContactPage.tsx", "components/ui/ContactForm.tsx"],
};
for (const [path, files] of Object.entries(CORE)) {
  const dirty = git("status", "--porcelain", "--", ...files).trim() !== "";
  const last = git("log", "-1", "--format=%cs", "--", ...files).trim();
  out[path] = dirty ? today : last;
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync("lib/pages/lastmod.json", JSON.stringify(sorted, null, 2) + "\n");
console.log(`lastmod.json: ${Object.keys(sorted).length} pages`);
