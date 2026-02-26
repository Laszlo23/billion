import { readFile } from "node:fs/promises";
import path from "node:path";

type Params = { params: { step: string } };

const stepFileMap: Record<string, string> = {
  "1": "uploadmenuphoto-8a8fbcaf-b4fb-4962-80c1-5c4213a76889.png",
  "2": "qr-generated-c483ddba-d040-4d0c-a433-cba50f06ff66.png",
  "3": "createmissions-06e0287c-ebcc-4820-a808-1ee18b27e480.png",
  "4": "approvesubmissions-86f18038-2f66-4dc6-9dde-b8de0f5b8ddd.png",
};

const assetsBaseDir =
  "/Users/poker.vibe/.cursor/projects/Users-poker-vibe-finalshophasan-billion/assets";

export async function GET(_: Request, { params }: Params) {
  try {
    const fileName = stepFileMap[params.step];
    if (!fileName) {
      return Response.json({ error: "Unknown step image." }, { status: 404 });
    }

    const filePath = path.join(assetsBaseDir, fileName);
    const buffer = await readFile(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load image.";
    return Response.json({ error: message }, { status: 500 });
  }
}
