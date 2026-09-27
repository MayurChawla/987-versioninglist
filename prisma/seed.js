const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with sample releases...");

  await prisma.release.deleteMany({});

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const release1 = await prisma.release.create({
    data: {
      name: "v3.0.0 Microservices Architecture Migration",
      date: nextWeek,
      additionalInfo: "Major infrastructure rewrite splitting monolith into gRPC services with Kubernetes deployment.",
      completedSteps: [],
    },
  });

  const release2 = await prisma.release.create({
    data: {
      name: "v2.5.0 Payment Gateway & Billing Portal",
      date: inThreeDays,
      additionalInfo: "Integration with Stripe Connect billing APIs and invoice generation engine.",
      completedSteps: ["step-1", "step-2", "step-3"],
    },
  });

  const release3 = await prisma.release.create({
    data: {
      name: "v2.4.1 Security Patch & Rate Limiting",
      date: yesterday,
      additionalInfo: "Emergency patch for API rate limiting and dependency updates.",
      completedSteps: [
        "step-1",
        "step-2",
        "step-3",
        "step-4",
        "step-5",
        "step-6",
        "step-7",
        "step-8",
      ],
    },
  });

  console.log("Seeding completed successfully!");
  console.log({ release1: release1.name, release2: release2.name, release3: release3.name });
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
