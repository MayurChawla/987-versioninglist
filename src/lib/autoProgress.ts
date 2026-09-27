import { prisma } from "./prisma";
import { parseStepsConfig, parseCompletedSteps } from "./graphql/schemaHelpers";

const activeTimers = new Map<string, NodeJS.Timeout>();

export function isReleaseAutoProgressing(releaseId: string): boolean {
  return activeTimers.has(releaseId);
}

export function stopBackendAutoProgress(releaseId: string) {
  const timer = activeTimers.get(releaseId);
  if (timer) {
    clearInterval(timer);
    activeTimers.delete(releaseId);
  }
}

export async function startBackendAutoProgress(releaseId: string) {
  // Clear any pre-existing timer for this release
  stopBackendAutoProgress(releaseId);

  // 1. Reset completedSteps to empty array in PostgreSQL (Not Started)
  const existing = await prisma.release.findUnique({ where: { id: releaseId } });
  if (!existing) return;

  await prisma.release.update({
    where: { id: releaseId },
    data: { completedSteps: [] },
  });

  const activeSteps = parseStepsConfig(existing.stepsConfig);
  let currentIndex = 0;

  // 2. Schedule recurring 3-second interval in Node.js backend
  const timer = setInterval(async () => {
    try {
      const currentRel = await prisma.release.findUnique({ where: { id: releaseId } });
      if (!currentRel) {
        stopBackendAutoProgress(releaseId);
        return;
      }

      const currentStepsConfig = parseStepsConfig(currentRel.stepsConfig);
      const currentCompleted = parseCompletedSteps(currentRel.completedSteps);

      // Find next uncompleted step
      const nextUncompletedStep = currentStepsConfig.find((s) => !currentCompleted.includes(s.id));

      if (nextUncompletedStep) {
        const updatedCompleted = [...currentCompleted, nextUncompletedStep.id];
        await prisma.release.update({
          where: { id: releaseId },
          data: { completedSteps: updatedCompleted },
        });

        // If all steps completed, stop the timer
        if (updatedCompleted.length >= currentStepsConfig.length) {
          stopBackendAutoProgress(releaseId);
        }
      } else {
        stopBackendAutoProgress(releaseId);
      }
    } catch (err) {
      console.error(`Backend auto progress error for release ${releaseId}:`, err);
      stopBackendAutoProgress(releaseId);
    }
  }, 3000);

  activeTimers.set(releaseId, timer);
}
