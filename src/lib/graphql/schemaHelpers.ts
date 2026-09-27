import { RELEASE_STEPS, StepDefinition } from "../steps";

export function parseCompletedSteps(input: any): string[] {
  if (Array.isArray(input)) {
    return input.map((s) => String(s));
  }
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s));
    } catch {
      const cleaned = input.replace(/^\{|\}$/g, "").trim();
      if (cleaned) {
        return cleaned.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      }
    }
  }
  return [];
}

export function parseStepsConfig(stepsConfigRaw: any): StepDefinition[] {
  if (Array.isArray(stepsConfigRaw) && stepsConfigRaw.length > 0) {
    return stepsConfigRaw.map((step: any, index: number) => ({
      id: step.id || `step-${index + 1}`,
      name: step.name || `Step ${index + 1}`,
      description: step.description || "",
    }));
  }
  return RELEASE_STEPS;
}
