import { saveUploadedFile } from "@/src/lib/uploads/localUpload";

const MAX_FILES = 8;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((value) => value instanceof File) as File[];

    if (!files.length) {
      return Response.json({ error: "No files uploaded." }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return Response.json(
        { error: `Maximum ${MAX_FILES} files allowed.` },
        { status: 400 },
      );
    }

    const uploaded = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        url: await saveUploadedFile(file, "menu"),
      })),
    );

    return Response.json({ files: uploaded });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload menu images.";
    return Response.json({ error: message }, { status: 500 });
  }
}
