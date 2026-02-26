import { describe, expect, it } from "vitest";

import { createSubmissionSchema } from "./submission";

describe("submission validation", () => {
  it("requires proof URL", () => {
    const result = createSubmissionSchema.safeParse({ userId: "u1", proofUrl: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid payload", () => {
    const result = createSubmissionSchema.safeParse({
      userId: "u1",
      proofUrl: "https://example.com/proof.jpg",
    });
    expect(result.success).toBe(true);
  });
});
