import { createSchema } from "graphql-yoga";
import { prisma } from "../prisma";
import { RELEASE_STEPS, computeReleaseStatus, StepDefinition } from "../steps";

export const typeDefs = /* GraphQL */ `
  type StepDefinition {
    id: String!
    name: String!
    description: String!
  }

  type ReleaseStepState {
    id: String!
    name: String!
    description: String!
    completed: Boolean!
  }

  type Release {
    id: ID!
    name: String!
    date: String!
    additionalInfo: String
    completedSteps: [String!]!
    status: String!
    totalSteps: Int!
    completedCount: Int!
    createdAt: String!
    updatedAt: String!
    steps: [ReleaseStepState!]!
  }

  input StepInput {
    id: String
    name: String!
    description: String
  }

  input CreateReleaseInput {
    name: String!
    date: String!
    additionalInfo: String
    stepsConfig: [StepInput!]
  }

  input UpdateReleaseInput {
    name: String
    date: String
    additionalInfo: String
    stepsConfig: [StepInput!]
  }

  type Query {
    releases: [Release!]!
    release(id: ID!): Release
    releaseSteps: [StepDefinition!]!
  }

  type Mutation {
    createRelease(input: CreateReleaseInput!): Release!
    updateRelease(id: ID!, input: UpdateReleaseInput!): Release!
    toggleStep(releaseId: ID!, stepId: String!, completed: Boolean!): Release!
    resetReleaseSteps(releaseId: ID!): Release!
    deleteRelease(id: ID!): Boolean!
  }
`;

function parseCompletedSteps(input: any): string[] {
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

function parseStepsConfig(stepsConfigRaw: any): StepDefinition[] {
  if (Array.isArray(stepsConfigRaw) && stepsConfigRaw.length > 0) {
    return stepsConfigRaw.map((step: any, index: number) => ({
      id: step.id || `step-${index + 1}`,
      name: step.name || `Step ${index + 1}`,
      description: step.description || "",
    }));
  }
  return RELEASE_STEPS;
}

function formatRelease(rel: any) {
  const completedSteps = parseCompletedSteps(rel.completedSteps);
  const activeSteps = parseStepsConfig(rel.stepsConfig);

  const status = computeReleaseStatus(completedSteps, activeSteps);
  const stepsState = activeSteps.map((step) => ({
    ...step,
    completed: completedSteps.includes(step.id),
  }));

  return {
    id: rel.id,
    name: rel.name,
    date: new Date(rel.date).toISOString(),
    additionalInfo: rel.additionalInfo ?? null,
    completedSteps,
    status,
    totalSteps: activeSteps.length,
    completedCount: completedSteps.length,
    createdAt: new Date(rel.createdAt).toISOString(),
    updatedAt: new Date(rel.updatedAt).toISOString(),
    steps: stepsState,
  };
}

export const resolvers = {
  Query: {
    releases: async () => {
      const dbReleases = await prisma.release.findMany({
        orderBy: { date: "asc" },
      });
      return dbReleases.map(formatRelease);
    },
    release: async (_: any, { id }: { id: string }) => {
      const dbRelease = await prisma.release.findUnique({
        where: { id },
      });
      if (!dbRelease) return null;
      return formatRelease(dbRelease);
    },
    releaseSteps: () => RELEASE_STEPS,
  },
  Mutation: {
    createRelease: async (
      _: any,
      { input }: { input: { name: string; date: string; additionalInfo?: string; stepsConfig?: any[] } }
    ) => {
      if (!input.name || input.name.trim() === "") {
        throw new Error("Release name is mandatory");
      }
      if (!input.date) {
        throw new Error("Release date is mandatory");
      }

      const releaseDate = new Date(input.date);
      if (isNaN(releaseDate.getTime())) {
        throw new Error("Invalid date format provided");
      }

      let parsedConfig: any = null;
      if (Array.isArray(input.stepsConfig) && input.stepsConfig.length > 0) {
        parsedConfig = input.stepsConfig.map((s, idx) => ({
          id: s.id || `step-${idx + 1}`,
          name: s.name.trim(),
          description: s.description ? s.description.trim() : "",
        }));
      }

      const dbRelease = await prisma.release.create({
        data: {
          name: input.name.trim(),
          date: releaseDate,
          additionalInfo: input.additionalInfo?.trim() || null,
          completedSteps: [], // Start with all steps unchecked (0 completed)
          stepsConfig: parsedConfig,
        },
      });

      return formatRelease(dbRelease);
    },

    updateRelease: async (
      _: any,
      { id, input }: { id: string; input: { name?: string; date?: string; additionalInfo?: string; stepsConfig?: any[] } }
    ) => {
      const existing = await prisma.release.findUnique({ where: { id } });
      if (!existing) {
        throw new Error(`Release with ID ${id} not found`);
      }

      const updateData: any = {};
      if (input.name !== undefined) {
        if (!input.name.trim()) throw new Error("Release name cannot be empty");
        updateData.name = input.name.trim();
      }
      if (input.date !== undefined) {
        const d = new Date(input.date);
        if (isNaN(d.getTime())) throw new Error("Invalid date format");
        updateData.date = d;
      }
      if (input.additionalInfo !== undefined) {
        updateData.additionalInfo = input.additionalInfo.trim() || null;
      }
      if (Array.isArray(input.stepsConfig)) {
        updateData.stepsConfig = input.stepsConfig.map((s, idx) => ({
          id: s.id || `step-${idx + 1}`,
          name: s.name.trim(),
          description: s.description ? s.description.trim() : "",
        }));
      }

      const updated = await prisma.release.update({
        where: { id },
        data: updateData,
      });

      return formatRelease(updated);
    },

    toggleStep: async (
      _: any,
      { releaseId, stepId, completed }: { releaseId: string; stepId: string; completed: Boolean }
    ) => {
      const existing = await prisma.release.findUnique({ where: { id: releaseId } });
      if (!existing) {
        throw new Error(`Release with ID ${releaseId} not found`);
      }

      const activeSteps = parseStepsConfig(existing.stepsConfig);
      const stepExists = activeSteps.some((s) => s.id === stepId);
      if (!stepExists) {
        throw new Error(`Invalid step ID: ${stepId}`);
      }

      let completedSteps = parseCompletedSteps(existing.completedSteps);

      if (completed) {
        if (!completedSteps.includes(stepId)) {
          completedSteps.push(stepId);
        }
      } else {
        completedSteps = completedSteps.filter((id) => id !== stepId);
      }

      const updated = await prisma.release.update({
        where: { id: releaseId },
        data: { completedSteps },
      });

      return formatRelease(updated);
    },

    resetReleaseSteps: async (_: any, { releaseId }: { releaseId: string }) => {
      const existing = await prisma.release.findUnique({ where: { id: releaseId } });
      if (!existing) {
        throw new Error(`Release with ID ${releaseId} not found`);
      }

      const updated = await prisma.release.update({
        where: { id: releaseId },
        data: { completedSteps: [] },
      });

      return formatRelease(updated);
    },

    deleteRelease: async (_: any, { id }: { id: string }) => {
      const existing = await prisma.release.findUnique({ where: { id } });
      if (!existing) {
        return false;
      }

      await prisma.release.delete({ where: { id } });
      return true;
    },
  },
};

export const schema = createSchema({
  typeDefs,
  resolvers,
});
