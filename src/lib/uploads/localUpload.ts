import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export async function saveUploadedFile(
  file: File,
  bucket: "menu" | "proof",
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const safeName = sanitizeFilename(path.basename(file.name, ext));
  const filename = `${Date.now()}-${randomUUID()}-${safeName}${ext}`;
  const relativeDir = path.join("uploads", bucket);
  const targetDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, filename), buffer);
  return `/${relativeDir}/${filename}`;
}
