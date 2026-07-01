/**
 * Copies the active site's assets (sites/<SITE>/assets) into
 * public/site-assets so images referenced in content.json resolve to
 * /site-assets/<name>. Runs automatically before `dev` and `build`.
 */
import fs from "node:fs";
import path from "node:path";

const SITE = (process.env.SITE || "demo").trim();
const root = process.cwd();
const srcDir = path.join(root, "sites", SITE, "assets");
const outDir = path.join(root, "public", "site-assets");

function reset(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

reset(outDir);

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, outDir, { recursive: true });
  const count = fs.readdirSync(srcDir).length;
  console.log(`[prepare-site] "${SITE}": copied ${count} asset(s) -> public/site-assets`);
} else {
  console.warn(`[prepare-site] "${SITE}": no assets dir at ${srcDir} (skipping)`);
}

// Ensure the content/theme JSON exist so the build fails early with a clear message.
for (const file of ["content.json", "theme.json"]) {
  const p = path.join(root, "sites", SITE, file);
  if (!fs.existsSync(p)) {
    console.error(`[prepare-site] MISSING sites/${SITE}/${file}`);
    process.exit(1);
  }
}
