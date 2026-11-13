// Builds the Chrome extension into extension/ and packs
// public/tabos-extension-v<version>.zip. Pure Node: works on Windows, macOS,
// Linux and in Lovable.   node scripts/build-extension.mjs
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ext = join(root, "extension");
const manifest = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
const versionTs = readFileSync(join(root, "src/lib/version.ts"), "utf8");
const appVersion = /TABOS_VERSION = "([^"]+)"/.exec(versionTs)?.[1];
if (appVersion !== manifest.version) {
  console.error(`Version mismatch: manifest ${manifest.version}, src/lib/version.ts ${appVersion}`);
  process.exit(1);
}

console.log(`→ Building TabOS extension v${manifest.version}`);
rmSync(join(ext, "assets"), { recursive: true, force: true });
execSync("npx vite build", { cwd: join(root, "extension-src"), stdio: "inherit" });
if (existsSync(join(ext, "index.html"))) renameSync(join(ext, "index.html"), join(ext, "newtab.html"));
rmSync(join(ext, "favicon.ico"), { force: true });

// --- zip (store + deflate, UTF-8 names, fixed timestamps) ---
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const walk = (d) =>
  readdirSync(d).sort().flatMap((n) => {
    const f = join(d, n);
    return statSync(f).isDirectory() ? walk(f) : n === ".DS_Store" ? [] : [f];
  });
const DATE = ((2024 - 1980) << 9) | (1 << 5) | 1;
const parts = [], central = [];
let offset = 0;
const files = walk(ext);
for (const full of files) {
  const name = Buffer.from(relative(ext, full).split(sep).join("/"));
  const data = readFileSync(full);
  const packed = deflateRawSync(data, { level: 9 });
  const deflate = packed.length < data.length;
  const body = deflate ? packed : data;
  const crc = crc32(data);
  const h = Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(deflate ? 8 : 0, 8);
  h.writeUInt16LE(0, 10); h.writeUInt16LE(DATE, 12); h.writeUInt32LE(crc, 14); h.writeUInt32LE(body.length, 18);
  h.writeUInt32LE(data.length, 22); h.writeUInt16LE(name.length, 26);
  parts.push(h, name, body);
  const c = Buffer.alloc(46);
  c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8);
  c.writeUInt16LE(deflate ? 8 : 0, 10); c.writeUInt16LE(0, 12); c.writeUInt16LE(DATE, 14); c.writeUInt32LE(crc, 16);
  c.writeUInt32LE(body.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(name.length, 28); c.writeUInt32LE(offset, 42);
  central.push(c, name);
  offset += h.length + name.length + body.length;
}
const size = central.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(size, 12); end.writeUInt32LE(offset, 16);
mkdirSync(join(root, "public"), { recursive: true });
for (const f of readdirSync(join(root, "public"))) if (/^tabos-extension.*\.zip$/.test(f)) rmSync(join(root, "public", f));
const zip = Buffer.concat([...parts, ...central, end]);
const out = join(root, "public", `tabos-extension-v${manifest.version}.zip`);
writeFileSync(out, zip);
console.log(`✓ ${relative(root, out)} — ${files.length} files, ${(zip.length / 1024).toFixed(0)} KB`);
