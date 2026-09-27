import { describe, it, expect } from "vitest";
import { computeReleaseStatus, TOTAL_STEPS_COUNT, RELEASE_STEPS } from "../lib/steps";

describe("computeReleaseStatus Unit Tests", () => {
  it("returns 'planned' when no steps are completed", () => {
    const status = computeReleaseStatus([]);
    expect(status).toBe("planned");
  });

  it("returns 'planned' when completed steps contain invalid IDs", () => {
    const status = computeReleaseStatus(["invalid-step-99"]);
    expect(status).toBe("planned");
  });

  it("returns 'ongoing' when at least 1 step is completed", () => {
    const status = computeReleaseStatus(["step-1"]);
    expect(status).toBe("ongoing");
  });

  it("returns 'ongoing' when some (not all) steps are completed", () => {
    const status = computeReleaseStatus(["step-1", "step-2", "step-3"]);
    expect(status).toBe("ongoing");
  });

  it("returns 'done' when all steps are completed", () => {
    const allStepIds = RELEASE_STEPS.map((s) => s.id);
    expect(allStepIds.length).toBe(TOTAL_STEPS_COUNT);

    const status = computeReleaseStatus(allStepIds);
    expect(status).toBe("done");
  });
});
