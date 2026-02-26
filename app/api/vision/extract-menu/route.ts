import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { menuExtractionRequestSchema } from "@/src/lib/validation/menu";
import { extractMenuFromImages } from "@/src/lib/vision/menuExtractionService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrls } = menuExtractionRequestSchema.parse(body);
    const extracted = await extractMenuFromImages(imageUrls);

    return Response.json(extracted);
  } catch (error) {
    return toErrorResponse(error, "Failed to extract menu.");
  }
}
