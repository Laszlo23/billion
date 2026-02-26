import { readFile } from "node:fs/promises";

const ATTACHED_IMAGE_PATH =
  "/Users/poker.vibe/.cursor/projects/Users-poker-vibe-finalshophasan-billion/assets/herobg-58ae56a8-ee72-42f5-8e36-82a2452dae7a.png";

export async function GET() {
  try {
    const file = await readFile(ATTACHED_IMAGE_PATH);
    return new Response(file, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Hero image not found.", { status: 404 });
  }
}
