import { saveUploadedFile } from "@/src/lib/uploads/localUpload";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Proof image is required." }, { status: 400 });
    }

    const url = await saveUploadedFile(file, "proof");
    return Response.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload proof.";
    return Response.json({ error: message }, { status: 500 });
  }
}
