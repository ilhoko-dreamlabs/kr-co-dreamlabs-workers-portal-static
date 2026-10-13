import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const distIndex = process.argv.indexOf("--dist");
const siteRoot = distIndex >= 0 ? path.resolve(root, process.argv[distIndex + 1] || "dist") : path.join(root, "site");
const phaseKeys = ["planning", "design", "development", "validation", "release", "runtime"];
const requiredFiles = ["index.html", "404.html", "css/portal.css", "js/portal.js", "data/status.json", "assets/fallback.svg"];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) throw new Error(message);
}

async function read(relative) {
  return readFile(path.join(siteRoot, relative), "utf8");
}

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

for (const relative of requiredFiles) {
  const info = await stat(path.join(siteRoot, relative));
  check(info.isFile() && info.size > 0, `Missing required static file: ${relative}`);
}

const index = await read("index.html");
const script = await read("js/portal.js");
const status = JSON.parse(await read("data/status.json"));

check(index.includes("Content-Security-Policy"), "index.html must define a static CSP");
check(index.includes("./css/portal.css") && index.includes("./js/portal.js"), "index.html must use packaged relative assets");
check(!/<script(?![^>]*\bsrc=)[^>]*>/iu.test(index), "inline scripts are prohibited");
check(!/\beval\s*\(/u.test(script), "eval is prohibited");
check(script.includes('fetch("./data/status.json"'), "Portal must load the reviewed JSON snapshot");
check(status.schemaVersion === "1.0.0", "Unsupported status schemaVersion");
check(Number.isFinite(Date.parse(status.observedAt)), "observedAt must be an ISO timestamp");
check(Number.isFinite(Date.parse(status.publishedAt)), "publishedAt must be an ISO timestamp");
check(Number.isInteger(status.staleAfterHours) && status.staleAfterHours > 0, "staleAfterHours must be positive");
check(status.source?.kind === "operator-reviewed-snapshot", "Snapshot source kind is invalid");
check(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-public-v[0-9]+$/u.test(status.source?.snapshotId || ""), "Snapshot ID is invalid");
check(status.source?.evidenceClass === "reviewed-private-source", "Snapshot evidence class is invalid");
check(Array.isArray(status.workstreams) && status.workstreams.length > 0, "At least one workstream is required");

const ids = new Set();
for (const item of status.workstreams) {
  check(typeof item.id === "string" && item.id.length > 0 && !ids.has(item.id), `Invalid or duplicate workstream id: ${item.id}`);
  ids.add(item.id);
  check(typeof item.needsAction === "boolean", `${item.id}: needsAction must be boolean`);
  check(Array.isArray(item.evidence) && Array.isArray(item.risks), `${item.id}: evidence and risks are required arrays`);
  for (const phase of phaseKeys) {
    const value = item[phase];
    check(value && ["tone", "label", "note"].every((key) => typeof value[key] === "string" && value[key].length > 0), `${item.id}: invalid ${phase}`);
  }
}

const anchors = new Set([...index.matchAll(/\sid="([^"]+)"/gu)].map((match) => match[1]));
for (const match of index.matchAll(/href="#([^"]+)"/gu)) check(anchors.has(match[1]), `Missing anchor target: #${match[1]}`);

const files = await walk(siteRoot);
for (const file of files) {
  if (!/\.(?:html|css|js|json|svg)$/iu.test(file)) continue;
  const content = await readFile(file, "utf8");
  check(!/gh[opusr]_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._~+\-/]{12,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u.test(content), `Possible secret in ${path.relative(siteRoot, file)}`);
  check(!/\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/u.test(content), `Private network address in ${path.relative(siteRoot, file)}`);
  check(!/\b(?:worker00|worker0|srv\d+|portainer|gitlab|req-[a-f0-9]{16,})\b/iu.test(content), `Internal operational identifier in ${path.relative(siteRoot, file)}`);
  const urlContent = content.replaceAll('xmlns="http://www.w3.org/2000/svg"', "");
  check(!/http:\/\//iu.test(urlContent), `Insecure HTTP URL in ${path.relative(siteRoot, file)}`);
}

if (distIndex < 0) {
  const assetLock = JSON.parse(await readFile(path.join(root, "config", "asset-lock.json"), "utf8"));
  check(assetLock.origin === "https://assets.dreamlabs.co.kr", "Unexpected asset origin");
  check(assetLock.qualification?.runtimeApplied === false, "Candidate asset lock must not claim runtime application");
}

console.log(`static validation passed: ${checks} checks, ${status.workstreams.length} workstreams`);
