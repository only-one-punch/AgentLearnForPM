#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const repoDir = path.resolve(process.env.CONTENT_REPO_DIR || process.cwd());
const databasePath = path.resolve(
  repoDir,
  process.env.DATABASE_PATH || "data/workbench.sqlite",
);
const backupArg = process.argv.find((arg) => !arg.startsWith("--"));
const force = process.argv.includes("--force");

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `${command} failed with exit code ${code}`));
    });
  });
}

async function assertIntegrity(sqlitePath) {
  const result = await run("sqlite3", [sqlitePath, "PRAGMA integrity_check;"]);
  if (result.trim() !== "ok") {
    throw new Error(`SQLite integrity check failed for ${sqlitePath}: ${result.trim()}`);
  }
}

async function main() {
  if (!backupArg) {
    throw new Error("Usage: node scripts/restore-db.mjs <backup.sqlite> --force");
  }

  const backupPath = path.resolve(backupArg);
  if (!existsSync(backupPath)) {
    throw new Error(`Backup file not found at ${backupPath}`);
  }

  if (!force) {
    throw new Error(
      `Refusing to overwrite ${databasePath}. Stop the app, then re-run with --force.`,
    );
  }

  await assertIntegrity(backupPath);
  await fs.mkdir(path.dirname(databasePath), { recursive: true });

  if (existsSync(databasePath)) {
    const preRestorePath = `${databasePath}.pre-restore-${timestamp()}`;
    await fs.copyFile(databasePath, preRestorePath);
    console.log(`Saved current database to ${preRestorePath}`);
  }

  const tempPath = `${databasePath}.restore-${timestamp()}`;
  await fs.copyFile(backupPath, tempPath);
  await fs.rename(tempPath, databasePath);
  console.log(`Restored ${backupPath} to ${databasePath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
