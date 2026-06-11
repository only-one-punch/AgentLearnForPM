import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const rootDir = resolve(".");
const standaloneDir = resolve(rootDir, ".next/standalone");
const staticSource = resolve(rootDir, ".next/static");
const staticTarget = resolve(standaloneDir, ".next/static");
const publicSource = resolve(rootDir, "public");
const publicTarget = resolve(standaloneDir, "public");

function fail(message) {
  console.error(`[prepare-standalone] ${message}`);
  process.exit(1);
}

function replaceDirectory(source, target) {
  mkdirSync(dirname(target), { recursive: true });
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

if (!existsSync(standaloneDir)) {
  fail("Missing .next/standalone. Run next build with output: \"standalone\" first.");
}

if (!existsSync(staticSource)) {
  fail("Missing .next/static. Run next build before preparing standalone assets.");
}

replaceDirectory(staticSource, staticTarget);

if (existsSync(publicSource)) {
  replaceDirectory(publicSource, publicTarget);
}

console.log("[prepare-standalone] Copied static assets into .next/standalone.");
