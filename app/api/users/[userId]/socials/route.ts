import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { prisma } from "@/src/lib/prisma";
import { updateSocialHandlesSchema } from "@/src/lib/validation/social";

type Params = { params: { userId: string } };

function cleanHandle(value: string | undefined) {
  if (value === undefined) return undefined;
  const cleaned = value.trim().replace(/^@+/, "");
  return cleaned || null;
}

export async function GET(_: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    const profile = await prisma.taskerProfile.upsert({
      where: { userId: params.userId },
      update: {},
      create: { userId: params.userId },
      select: {
        instagramHandle: true,
        instagramStatus: true,
        tiktokHandle: true,
        tiktokStatus: true,
        linkedinHandle: true,
        linkedinStatus: true,
        updatedAt: true,
      },
    });

    return Response.json({
      socials: {
        instagram: {
          handle: profile.instagramHandle,
          status: profile.instagramStatus,
        },
        tiktok: {
          handle: profile.tiktokHandle,
          status: profile.tiktokStatus,
        },
        linkedin: {
          handle: profile.linkedinHandle,
          status: profile.linkedinStatus,
        },
      },
      lastUpdatedAt: profile.updatedAt,
      prototypeMode: true,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to load social connections.");
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = updateSocialHandlesSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    const instagramHandle = cleanHandle(parsed.instagramHandle);
    const tiktokHandle = cleanHandle(parsed.tiktokHandle);
    const linkedinHandle = cleanHandle(parsed.linkedinHandle);

    const profile = await prisma.taskerProfile.upsert({
      where: { userId: params.userId },
      update: {
        instagramHandle,
        instagramStatus: instagramHandle ? "connected_unverified" : "disconnected",
        tiktokHandle,
        tiktokStatus: tiktokHandle ? "connected_unverified" : "disconnected",
        linkedinHandle,
        linkedinStatus: linkedinHandle ? "connected_unverified" : "disconnected",
      },
      create: {
        userId: params.userId,
        instagramHandle,
        instagramStatus: instagramHandle ? "connected_unverified" : "disconnected",
        tiktokHandle,
        tiktokStatus: tiktokHandle ? "connected_unverified" : "disconnected",
        linkedinHandle,
        linkedinStatus: linkedinHandle ? "connected_unverified" : "disconnected",
      },
      select: {
        instagramHandle: true,
        instagramStatus: true,
        tiktokHandle: true,
        tiktokStatus: true,
        linkedinHandle: true,
        linkedinStatus: true,
      },
    });

    return Response.json({
      socials: {
        instagram: {
          handle: profile.instagramHandle,
          status: profile.instagramStatus,
        },
        tiktok: {
          handle: profile.tiktokHandle,
          status: profile.tiktokStatus,
        },
        linkedin: {
          handle: profile.linkedinHandle,
          status: profile.linkedinStatus,
        },
      },
      prototypeMode: true,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to save social handles.");
  }
}
