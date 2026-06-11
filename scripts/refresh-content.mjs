#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const repoDir = path.resolve(process.env.CONTENT_REPO_DIR || process.cwd());
const generatedDir = path.resolve(
  repoDir,
  process.env.GENERATED_CONTENT_DIR || ".generated/knowledge",
);
const statusPath = path.resolve(
  repoDir,
  process.env.REFRESH_STATUS_PATH || "data/refresh-status.json",
);
const remote = process.env.REFRESH_GIT_REMOTE || "origin";
const branch = process.env.REFRESH_GIT_BRANCH || "main";
const allowGitPull =
  process.argv.includes("--pull") ||
  (process.env.REFRESH_ALLOW_GIT_PULL || "").toLowerCase() === "true";
const skipGitPull = process.argv.includes("--no-pull");

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoDir,
      env: { ...process.env, ...options.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (options.echo) process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      if (options.echo) process.stderr.write(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      const error = new Error(
        `${command} ${args.join(" ")} failed with exit code ${code}`,
      );
      error.stdout = stdout;
      error.stderr = stderr;
      error.code = code;
      reject(error);
    });
  });
}

async function writeStatus(status) {
  const payload = {
    updatedAt: new Date().toISOString(),
    ...status,
  };
  await fs.mkdir(path.dirname(statusPath), { recursive: true });
  await fs.writeFile(statusPath, `${JSON.stringify(payload, null, 2)}\n`);
}

async function dirHasFiles(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length > 0;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function copyDirIfExists(source, target) {
  if (!existsSync(source)) return false;
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true });
  return true;
}

async function currentGitCommit() {
  try {
    const { stdout } = await run("git", ["rev-parse", "HEAD"]);
    return stdout.trim();
  } catch {
    return null;
  }
}

async function contentHash(dir) {
  if (!(await dirHasFiles(dir))) return null;
  const files = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        files.push(absolute);
      }
    }
  }

  await walk(dir);
  files.sort();

  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(dir, file));
    hash.update("\0");
    hash.update(await fs.readFile(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function packageJson() {
  const packageJsonPath = path.join(repoDir, "package.json");
  if (!existsSync(packageJsonPath)) return null;
  return JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
}

async function runPackageScript(scriptName, env) {
  const pkg = await packageJson();
  if (!pkg?.scripts?.[scriptName]) {
    throw new Error(
      `Integration assumption missing: package.json script "${scriptName}" was not found.`,
    );
  }

  if (existsSync(path.join(repoDir, "pnpm-lock.yaml"))) {
    return run("pnpm", ["run", scriptName], { env, echo: true });
  }
  if (existsSync(path.join(repoDir, "yarn.lock"))) {
    return run("yarn", ["run", scriptName], { env, echo: true });
  }
  return run("npm", ["run", scriptName], { env, echo: true });
}

async function main() {
  const startedAt = new Date().toISOString();
  const scratchRoot = await fs.mkdtemp(path.join(os.tmpdir(), "workbench-refresh-"));
  const tempGeneratedDir = path.join(scratchRoot, "knowledge-next");
  const previousGeneratedDir = path.join(scratchRoot, "knowledge-previous");
  let restoredPrevious = false;

  await writeStatus({ state: "running", startedAt, generatedDir });

  try {
    if (allowGitPull && !skipGitPull) {
      await run("git", ["fetch", remote, branch], { echo: true });
      await run("git", ["pull", "--ff-only", remote, branch], { echo: true });
    }

    await copyDirIfExists(generatedDir, previousGeneratedDir);
    await fs.mkdir(tempGeneratedDir, { recursive: true });

    await runPackageScript("content:build", {
      GENERATED_CONTENT_DIR: tempGeneratedDir,
      CONTENT_OUTPUT_DIR: tempGeneratedDir,
    });

    if (!(await dirHasFiles(tempGeneratedDir))) {
      throw new Error(
        `Content refresh produced no files in ${tempGeneratedDir}. Check the content:build script output path.`,
      );
    }

    await fs.rm(generatedDir, { recursive: true, force: true });
    await fs.mkdir(path.dirname(generatedDir), { recursive: true });
    await fs.rename(tempGeneratedDir, generatedDir);

    const finishedAt = new Date().toISOString();
    const version = await contentHash(generatedDir);
    await writeStatus({
      state: "success",
      startedAt,
      finishedAt,
      gitCommit: await currentGitCommit(),
      contentVersion: version,
      contentHash: version,
      generatedDir,
      pulled: allowGitPull && !skipGitPull,
    });
  } catch (error) {
    if (existsSync(previousGeneratedDir)) {
      await fs.rm(generatedDir, { recursive: true, force: true });
      await fs.mkdir(path.dirname(generatedDir), { recursive: true });
      await fs.cp(previousGeneratedDir, generatedDir, { recursive: true });
      restoredPrevious = true;
    }

    await writeStatus({
      state: "failed",
      startedAt,
      finishedAt: new Date().toISOString(),
      gitCommit: await currentGitCommit(),
      generatedDir,
      restoredPreviousGeneratedContent: restoredPrevious,
      error: error.message,
      stderr: error.stderr?.slice(0, 4000),
    });
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await fs.rm(scratchRoot, { recursive: true, force: true });
  }
}

await main();
