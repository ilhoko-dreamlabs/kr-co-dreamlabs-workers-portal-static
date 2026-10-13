import { cp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "site");
const output = path.join(root, "dist");
if (!output.startsWith(`${root}${path.sep}`)) throw new Error("Refusing to package outside repository");

await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true, force: false, errorOnExist: true });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.isFile()) files.push(absolute);
    else throw new Error(`Unsupported deploy entry: ${absolute}`);
  }
  return files;
}

let sourceRevision = "WORKING-TREE";
try {
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  sourceRevision = dirty ? `WORKING-TREE:${head}` : head;
} catch {
  // Initial repository packaging is intentionally labeled as a working tree.
}

const files = [];
for (const absolute of (await walk(output)).sort()) {
  const bytes = await readFile(absolute);
  files.push({
    path: path.relative(output, absolute).split(path.sep).join("/"),
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}

const manifest = { schemaVersion: "1.0.0", sourceRevision, files };
await writeFile(path.join(output, "build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`packaged ${files.length} static files from ${sourceRevision}`);
