import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  OnboardingQuestClaimError,
  OnboardingQuestNotFoundError,
} from "@/src/lib/gamification/onboardingQuestService";
import {
  ReferralNotFoundError,
  ReferralValidationError,
} from "@/src/lib/gamification/referralService";
import {
  DomainConflictError,
  DomainNotFoundError,
  DomainValidationError,
} from "@/src/lib/submissions/submissionService";

export function toErrorResponse(
  error: unknown,
  fallbackMessage: string,
): Response {
  if (error instanceof z.ZodError || error instanceof DomainValidationError) {
    return Response.json(
      { error: error.message || fallbackMessage },
      { status: 400 },
    );
  }

  if (error instanceof DomainConflictError) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof DomainNotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof OnboardingQuestClaimError || error instanceof ReferralValidationError) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof OnboardingQuestNotFoundError || error instanceof ReferralNotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.message.includes("fetch failed"))
  ) {
    return Response.json(
      { error: "Database unavailable. Please try again." },
      { status: 503 },
    );
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return Response.json({ error: message }, { status: 500 });
}
