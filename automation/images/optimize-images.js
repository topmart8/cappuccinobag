import fs from "node:fs/promises";
import path from "node:path";

export async function optimizeImage(inputPath, outputPath, options = {}) {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    return { skipped: true, reason: "Install the optional sharp dependency to convert images." };
  }
  const width = Math.max(320, Math.min(2400, Number(options.width) || 1600));
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const image = sharp(inputPath, { failOn: "error" }).rotate().resize({ width, withoutEnlargement: true });
  const info = await image.webp({ quality: Number(options.quality) || 82, effort: 4 }).toFile(outputPath);
  return { skipped: false, outputPath, width: info.width, height: info.height, size: info.size, format: info.format };
}
