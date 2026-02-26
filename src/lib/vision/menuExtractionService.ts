import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import path from "node:path";

type ExtractedMenu = {
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      price: string;
      currency: string;
    }>;
  }>;
};

export async function extractMenuFromImages(
  imageUrls: string[],
): Promise<ExtractedMenu> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async function toOpenAiImageUrl(url: string) {
    if (url.startsWith("/uploads/")) {
      const absolutePath = path.join(process.cwd(), "public", url);
      const file = await readFile(absolutePath);
      const ext = path.extname(url).toLowerCase();
      const mimeType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "image/jpeg";
      return `data:${mimeType};base64,${file.toString("base64")}`;
    }
    return url;
  }

  const normalizedImageUrls = await Promise.all(
    imageUrls.map((url) => toOpenAiImageUrl(url)),
  );

  const input = [
    {
      role: "user" as const,
      content: [
        {
          type: "input_text" as const,
          text: "Extract menu categories and items from these photos. Return strict JSON only with shape: {\"categories\":[{\"name\":\"...\",\"items\":[{\"name\":\"...\",\"price\":\"<integer smallest unit>\",\"currency\":\"USD\"}]}]}. Use integer prices only.",
        },
        ...normalizedImageUrls.map((url) => ({
          type: "input_image" as const,
          image_url: url,
          detail: "auto" as const,
        })),
      ],
    },
  ];

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input,
  });

  const text =
    response.output_text ||
    JSON.stringify((response.output[0] as { content?: unknown[] })?.content?.[0]);

  const parsed = JSON.parse(text) as ExtractedMenu;
  if (!parsed.categories?.length) {
    throw new Error("No categories extracted from menu photos.");
  }
  return parsed;
}
