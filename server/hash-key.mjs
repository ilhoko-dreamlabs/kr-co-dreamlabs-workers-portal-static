import process from "node:process";
import { hashDownloadKey } from "./download-server.mjs";

if (process.stdin.isTTY) {
  console.error("Pipe the download key through stdin; do not pass it as a command argument.");
  process.exitCode = 1;
} else {
  let value = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) value += chunk;
  const digest = hashDownloadKey(value.replace(/[\r\n]+$/u, ""));
  if (!digest) {
    console.error("Download key must be between 16 and 512 characters.");
    process.exitCode = 1;
  } else {
    process.stdout.write(`${digest}\n`);
  }
}
