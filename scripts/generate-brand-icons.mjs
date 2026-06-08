import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public", "logo-mark.svg");
const svg = readFileSync(svgPath);

async function png(size) {
  return sharp(svg).resize(size, size).png().toBuffer();
}

const faviconSizes = [16, 32, 48];
const faviconBuffers = await Promise.all(faviconSizes.map((size) => png(size)));

writeFileSync(join(root, "public", "favicon.ico"), await toIco(faviconBuffers));
writeFileSync(join(root, "public", "apple-touch-icon.png"), await png(180));
writeFileSync(join(root, "public", "logo-mark.png"), await png(512));
writeFileSync(join(root, "public", "icon-192.png"), await png(192));

console.log("Generated favicon.ico, apple-touch-icon.png, logo-mark.png, icon-192.png");
