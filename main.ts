import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const out = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const root = new URL(".", import.meta.url).pathname;
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
cpSync(join(root, "app"), join(out, "app"), { recursive: true });
cpSync(join(root, "screenshots"), join(out, "screenshots"), { recursive: true });
writeFileSync(join(out, "dossier.json"), buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
}));
