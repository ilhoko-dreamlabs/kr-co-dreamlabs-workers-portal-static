import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const distIndex = process.argv.indexOf("--dist");
const siteRoot = distIndex >= 0 ? path.resolve(root, process.argv[distIndex + 1] || "dist") : path.join(root, "site");
const requiredFiles = [
  "index.html",
  "404.html",
  "workers/index.html",
  "workerops/index.html",
  "ecosystem/index.html",
  "learn/index.html",
  "about/index.html",
  "status/index.html",
  "css/portal.css",
  "js/portal.js",
  "data/directory.json",
  "data/collections.json",
  "data/portal-status.json",
];
const pageFiles = requiredFiles.filter((relative) => relative.endsWith(".html"));
const allowedHosts = new Set([
  "portal.workers.dreamlabs.co.kr",
  "worker-host.dreamlabs.co.kr",
  "workers.dreamlabs.co.kr",
  "worker-meet.dreamlabs.co.kr",
  "manual.workers.dreamlabs.co.kr",
  "assets.dreamlabs.co.kr",
  "hr.dreamlabs.co.kr",
]);
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

function isAllowedPublicUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return parsed.protocol === "https:" && (allowedHosts.has(parsed.hostname) || parsed.hostname.endsWith(".workers.dreamlabs.co.kr"));
}

for (const relative of requiredFiles) {
  const info = await stat(path.join(siteRoot, relative));
  check(info.isFile() && info.size > 0, `Missing required static file: ${relative}`);
}

for (const relative of pageFiles) {
  const html = await read(relative);
  check(html.includes("Content-Security-Policy"), `${relative}: static CSP is required`);
  check(html.includes('href="/css/portal.css"'), `${relative}: packaged stylesheet is required`);
  check(!/<script(?![^>]*\bsrc=)[^>]*>/iu.test(html), `${relative}: inline scripts are prohibited`);
  check((html.match(/<h1\b/giu) || []).length === 1, `${relative}: exactly one h1 is required`);
  if (relative !== "404.html") check(html.includes('src="/js/portal.js"'), `${relative}: packaged script is required`);

  const anchors = new Set([...html.matchAll(/\sid="([^"]+)"/gu)].map((match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/gu)) check(anchors.has(match[1]), `${relative}: missing anchor #${match[1]}`);
  for (const match of html.matchAll(/<a\b[^>]*href="(https:\/\/[^"#]+(?:#[^"]*)?)"[^>]*>/giu)) {
    check(isAllowedPublicUrl(match[1]), `${relative}: public URL is not allowlisted: ${match[1]}`);
    check(/\btarget="_blank"/iu.test(match[0]) && /\brel="noreferrer"/iu.test(match[0]), `${relative}: external links must open safely`);
  }
}

const script = await read("js/portal.js");
const directory = JSON.parse(await read("data/directory.json"));
const collections = JSON.parse(await read("data/collections.json"));
const portalStatus = JSON.parse(await read("data/portal-status.json"));

check(!/\beval\s*\(/u.test(script), "eval is prohibited");
check(!/\/api\/|Authorization|WebSocket|EventSource|localStorage|sessionStorage/u.test(script), "browser code must stay outside runtime/authentication APIs");
check(script.includes('fetch("/data/portal-status.json"'), "browser must read only the publication boundary snapshot");
check(script.includes('fetch("/build-manifest.json"'), "browser must read the packaged build manifest");

check(directory.schemaVersion === "2.0.0", "Unsupported directory schemaVersion");
check(Number.isFinite(Date.parse(directory.reviewedAt)), "directory reviewedAt must be an ISO timestamp");
check(directory.source?.kind === "operator-reviewed-directory", "Directory source kind is invalid");
check(Array.isArray(directory.items) && directory.items.length > 0, "Directory items are required");

const ids = new Set();
const kinds = new Set(["worker", "product", "service", "business-system", "guide", "standard", "explanation"]);
const accessValues = new Set(["public", "login-required", "access-controlled", "restricted"]);
const availabilityValues = new Set(["https-observed", "manifest-backed", "candidate-only", "unavailable"]);
for (const item of directory.items) {
  check(typeof item.id === "string" && /^[a-z0-9-]+$/u.test(item.id) && !ids.has(item.id), `Invalid or duplicate directory id: ${item.id}`);
  ids.add(item.id);
  check(kinds.has(item.kind), `${item.id}: invalid kind`);
  check(typeof item.title === "string" && item.title.length > 0, `${item.id}: title is required`);
  check(typeof item.summary === "string" && item.summary.length > 0, `${item.id}: summary is required`);
  check(isAllowedPublicUrl(item.url), `${item.id}: URL is not allowlisted`);
  check(Array.isArray(item.audiences) && item.audiences.length > 0, `${item.id}: audiences are required`);
  check(Array.isArray(item.tags) && item.tags.length > 0, `${item.id}: tags are required`);
  check(accessValues.has(item.access), `${item.id}: invalid access`);
  check(item.exposure === "public-listable", `${item.id}: only public-listable entries may be published`);
  check(availabilityValues.has(item.availability), `${item.id}: invalid availability`);
  check(Number.isFinite(Date.parse(item.linkReview?.observedAt)), `${item.id}: link review timestamp is invalid`);
  check(Array.isArray(item.actions) && item.actions.length > 0, `${item.id}: at least one action is required`);
  for (const action of item.actions) check(typeof action.label === "string" && isAllowedPublicUrl(action.url), `${item.id}: invalid action`);
}
check(directory.items.filter((item) => item.kind === "worker").length === 8, "Exactly eight public-listable Workers are expected");
check(directory.items.some((item) => item.id === "hr-system" && item.kind === "business-system"), "HR must remain a connected business system");

check(collections.schemaVersion === "2.0.0" && Array.isArray(collections.collections), "Collections contract is invalid");
const collectionIds = new Set();
for (const collection of collections.collections) {
  check(typeof collection.id === "string" && !collectionIds.has(collection.id), `Invalid or duplicate collection: ${collection.id}`);
  collectionIds.add(collection.id);
  check(Array.isArray(collection.itemIds) && collection.itemIds.length > 0, `${collection.id}: itemIds are required`);
  for (const itemId of collection.itemIds) check(ids.has(itemId), `${collection.id}: unknown item ${itemId}`);
}

check(portalStatus.schemaVersion === "2.0.0", "Unsupported portal status schemaVersion");
check(portalStatus.mode === "public-static-directory", "Portal mode must remain static");
check(portalStatus.runtimeAuthority === false && portalStatus.liveWorkerData === false, "Portal must not claim runtime authority or live data");
check(Number.isFinite(Date.parse(portalStatus.catalogReviewedAt)), "Portal catalog review timestamp is invalid");

const files = await walk(siteRoot);
for (const file of files) {
  if (!/\.(?:html|css|js|json|svg)$/iu.test(file)) continue;
  const content = await readFile(file, "utf8");
  const relative = path.relative(siteRoot, file);
  check(!/gh[opusr]_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._~+\-/]{12,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u.test(content), `Possible secret in ${relative}`);
  check(!/\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/u.test(content), `Private network address in ${relative}`);
  check(!/\b(?:worker00|srv\d+|req-[a-f0-9]{16,})\b/iu.test(content), `Internal operational identifier in ${relative}`);
  check(!/[A-Za-z]:\\(?:dreamlabs|Users)\\/iu.test(content), `Local filesystem path in ${relative}`);
  const urlContent = content.replaceAll('xmlns="http://www.w3.org/2000/svg"', "");
  check(!/http:\/\//iu.test(urlContent), `Insecure HTTP URL in ${relative}`);
}

if (distIndex < 0) {
  const assetLock = JSON.parse(await readFile(path.join(root, "config", "asset-lock.json"), "utf8"));
  check(assetLock.schemaVersion === "2.0.0", "Unsupported asset lock schemaVersion");
  check(assetLock.reference?.site === "https://assets.dreamlabs.co.kr/", "Unexpected asset reference site");
  check(assetLock.reference?.manifestVersion === "0.1.2", "Unexpected Asset Pack manifest version");
  check(assetLock.reference?.catalogStatus === "candidate-inspection" && assetLock.reference?.approvalStatus === "mixed", "Asset Pack candidate and approval states must remain explicit");
  check(assetLock.packaging?.mode === "hybrid" && assetLock.packaging?.runtimeHotlink === true, "Approved runtime asset must use the tracked Asset Pack origin");
  check(assetLock.packaging?.allowedOrigin === "https://assets.dreamlabs.co.kr", "Unexpected runtime asset origin");
  check(assetLock.assets?.some((asset) => asset.url === "https://assets.dreamlabs.co.kr/agents/dreamlabs-worker/icon/dreamlabs-bot-icon.png" && asset.sourceApprovalStatus === "approved" && asset.portalRuntimeApplied === true), "Approved Worker Agent icon must be tracked as runtime-applied");
  for (const relative of pageFiles) {
    const html = await read(relative);
    check(html.includes("https://assets.dreamlabs.co.kr"), `${relative}: Asset Pack origin must be declared`);
  }
}

console.log(`static validation passed: ${checks} checks, ${directory.items.length} directory items`);
