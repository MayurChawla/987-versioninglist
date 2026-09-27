export interface StepDefinition {
  id: string;
  name: string;
  description: string;
}

export const RELEASE_STEPS: StepDefinition[] = [
  {
    id: "step-1",
    name: "Code Freeze & Branch Cut",
    description: "Lock feature development and cut release candidate branch.",
  },
  {
    id: "step-2",
    name: "Automated Testing Suite",
    description: "Execute end-to-end regression and unit test suite in CI/CD pipeline.",
  },
  {
    id: "step-3",
    name: "Security & Vulnerability Audit",
    description: "Run SAST, dependency checks, and container image scans.",
  },
  {
    id: "step-4",
    name: "Staging Deployment & QA Verification",
    description: "Deploy release build to staging environment and confirm QA signoff.",
  },
  {
    id: "step-5",
    name: "Database Migration Prep",
    description: "Validate backward-compatible schema migrations and rollback plan.",
  },
  {
    id: "step-6",
    name: "Production Rollout",
    description: "Execute production deployment with canary / zero-downtime strategy.",
  },
  {
    id: "step-7",
    name: "Post-Deploy Smoke Test & Monitoring",
    description: "Verify core user flows, APM metrics, latency, and error rates.",
  },
  {
    id: "step-8",
    name: "Release Announcement & Changelog",
    description: "Publish customer release notes and inform cross-functional teams.",
  },
];

export const TOTAL_STEPS_COUNT = RELEASE_STEPS.length;

export type ReleaseStatus = "planned" | "ongoing" | "done";

/**
 * Computes release status dynamically based on completion state of steps:
 * - 0 completed steps: "planned"
 * - At least 1 completed step, but not all: "ongoing"
 * - All steps completed: "done"
 */
export function computeReleaseStatus(completedStepIds: string[] = []): ReleaseStatus {
  const validCompleted = completedStepIds.filter((id) =>
    RELEASE_STEPS.some((step) => step.id === id)
  );

  if (validCompleted.length === 0) {
    return "planned";
  }

  if (validCompleted.length === TOTAL_STEPS_COUNT) {
    return "done";
  }

  return "ongoing";
}
