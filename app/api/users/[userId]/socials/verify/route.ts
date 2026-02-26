import { toErrorResponse } from "@/src/lib/http/errorResponse";
import { OnboardingQuestService } from "@/src/lib/gamification/onboardingQuestService";
import { prisma } from "@/src/lib/prisma";
import { verifySocialSchema } from "@/src/lib/validation/social";

type Params = { params: { userId: string } };

type VerifyFields = {
  handleField: "instagramHandle" | "tiktokHandle" | "linkedinHandle";
  statusField: "instagramStatus" | "tiktokStatus" | "linkedinStatus";
};

const verifyFieldByPlatform: Record<"instagram" | "tiktok" | "linkedin", VerifyFields> = {
  instagram: { handleField: "instagramHandle", statusField: "instagramStatus" },
  tiktok: { handleField: "tiktokHandle", statusField: "tiktokStatus" },
  linkedin: { handleField: "linkedinHandle", statusField: "linkedinStatus" },
};

export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { platform } = verifySocialSchema.parse(body);
    const targetFields = verifyFieldByPlatform[platform];

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
      },
    });

    const handleValue = profile[targetFields.handleField];
    if (!handleValue) {
      return Response.json(
        { error: `Connect your ${platform} handle before verifying.` },
        { status: 400 },
      );
    }

    const updated = await prisma.taskerProfile.update({
      where: { userId: params.userId },
      data: { [targetFields.statusField]: "connected_verified" },
      select: {
        instagramHandle: true,
        instagramStatus: true,
        tiktokHandle: true,
        tiktokStatus: true,
        linkedinHandle: true,
        linkedinStatus: true,
      },
    });

    await OnboardingQuestService.trackEvent({
      userId: params.userId,
      triggerType: "social_verified",
      referenceId: `${platform}:${params.userId}`,
    });

    return Response.json({
      socials: {
        instagram: {
          handle: updated.instagramHandle,
          status: updated.instagramStatus,
        },
        tiktok: {
          handle: updated.tiktokHandle,
          status: updated.tiktokStatus,
        },
        linkedin: {
          handle: updated.linkedinHandle,
          status: updated.linkedinStatus,
        },
      },
      verifiedPlatform: platform,
      prototypeMode: true,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to verify social connection.");
  }
}
