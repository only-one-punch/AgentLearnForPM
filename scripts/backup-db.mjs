#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const repoDir = path.resolve(process.env.CONTENT_REPO_DIR || process.cwd());
const databasePath = path.resolve(
  repoDir,
  process.env.DATABASE_PATH || "data/workbench.sqlite",
);
const backupDir = path.resolve(repoDir, process.env.BACKUP_DIR || "backups");

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `${command} failed with exit code ${code}`));
    });
  });
}

async function sha256(file) {
  const hash = createHash("sha256");
  hash.update(await fs.readFile(file));
  return hash.digest("hex");
}

async function main() {
  if (!existsSync(databasePath)) {
    throw new Error(`SQLite database not found at ${databasePath}`);
  }

  await fs.mkdir(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `workbench-${timestamp()}.sqlite`);
  const manifestPath = `${backupPath}.json`;

  await run("sqlite3", [databasePath, `.backup '${backupPath.replaceAll("'", "''")}'`]);

  const stat = await fs.stat(backupPath);
  const manifest = {
    createdAt: new Date().toISOString(),
    sourceDatabasePath: databasePath,
    backupPath,
    bytes: stat.size,
    sha256: await sha256(backupPath),
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(backupPath);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
