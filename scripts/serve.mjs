import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.cwd(), process.argv[2] || "site");
const port = Number(process.argv[3] || 4178);
const types = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"]]);

createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
  let file = path.resolve(root, relative);
  if (!file.startsWith(`${root}${path.sep}`) && file !== root) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    response.writeHead(200, { "content-type": types.get(path.extname(file)) || "application/octet-stream", "cache-control": "no-store" });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    createReadStream(path.join(root, "404.html")).pipe(response);
  }
}).listen(port, "127.0.0.1", () => console.log(`Worker Portal: http://127.0.0.1:${port}/`));
