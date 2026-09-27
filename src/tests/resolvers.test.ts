import { describe, it, expect, vi } from "vitest";
import { resolvers } from "../lib/graphql/schema";

vi.mock("../lib/prisma", () => {
  const mockReleases = [
    {
      id: "rel-1",
      name: "v1.0.0 Release",
      date: new Date("2026-10-01T00:00:00.000Z"),
      additionalInfo: "First major release",
      completedSteps: ["step-1"],
      createdAt: new Date("2026-09-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-01T00:00:00.000Z"),
    },
  ];

  return {
    prisma: {
      release: {
        findMany: vi.fn().mockResolvedValue(mockReleases),
        findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => {
          const item = mockReleases.find((r) => r.id === where.id);
          return Promise.resolve(item || null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          return Promise.resolve({
            id: "rel-new",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const item = mockReleases.find((r) => r.id === where.id);
          return Promise.resolve({
            ...item,
            ...data,
            updatedAt: new Date(),
          });
        }),
        delete: vi.fn().mockResolvedValue(true),
      },
    },
  };
});

describe("GraphQL Resolvers Integration Tests", () => {
  it("fetches static release steps definitions", async () => {
    const steps = resolvers.Query.releaseSteps();
    expect(steps).toBeDefined();
    expect(steps.length).toBeGreaterThanOrEqual(7);
  });

  it("fetches releases list and computes ongoing status correctly", async () => {
    const releases = await resolvers.Query.releases();
    expect(releases).toHaveLength(1);
    expect(releases[0].name).toBe("v1.0.0 Release");
    expect(releases[0].status).toBe("ongoing");
    expect(releases[0].completedCount).toBe(1);
  });

  it("creates a new release via GraphQL mutation", async () => {
    const newRelease = await resolvers.Mutation.createRelease(null, {
      input: {
        name: "v2.0.0 Microservices",
        date: "2026-12-01T00:00:00.000Z",
        additionalInfo: "New feature rollout",
      },
    });

    expect(newRelease).toBeDefined();
    expect(newRelease.name).toBe("v2.0.0 Microservices");
    expect(newRelease.status).toBe("planned");
    expect(newRelease.completedCount).toBe(0);
  });

  it("toggles step state and updates completion status", async () => {
    const updated = await resolvers.Mutation.toggleStep(null, {
      releaseId: "rel-1",
      stepId: "step-2",
      completed: true,
    });

    expect(updated).toBeDefined();
    expect(updated.completedSteps).toContain("step-2");
  });
});
