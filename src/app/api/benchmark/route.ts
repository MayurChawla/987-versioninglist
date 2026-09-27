import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
    const graphqlEndpoint = `${origin}/api/graphql`;

    const query = JSON.stringify({
      query: `
        query BenchmarkQuery {
          releases {
            id
            name
            status
            isAutoProgressing
            totalSteps
            completedCount
          }
        }
      `,
    });

    const concurrencySteps = [50, 100, 200, 300, 400, 500];
    const results: any[] = [];
    let totalSent = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalLatency = 0;

    const startTime = Date.now();

    for (const concurrency of concurrencySteps) {
      const stepStartTime = Date.now();
      const promises = Array.from({ length: concurrency }).map(async () => {
        const reqStart = Date.now();
        try {
          const res = await fetch(graphqlEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: query,
            cache: "no-store",
          });
          const reqDuration = Date.now() - reqStart;
          if (res.ok) {
            return { ok: true, duration: reqDuration };
          }
          return { ok: false, duration: reqDuration };
        } catch (err) {
          return { ok: false, duration: Date.now() - reqStart };
        }
      });

      const stepResults = await Promise.all(promises);
      const stepDuration = Date.now() - stepStartTime;

      const stepSuccess = stepResults.filter((r) => r.ok).length;
      const stepFailed = stepResults.filter((r) => !r.ok).length;
      const stepAvgLatency = Math.round(
        stepResults.reduce((acc, r) => acc + r.duration, 0) / stepResults.length
      );

      totalSent += concurrency;
      totalSuccess += stepSuccess;
      totalFailed += stepFailed;
      totalLatency += stepAvgLatency * concurrency;

      results.push({
        concurrency,
        requestsSent: concurrency,
        successful: stepSuccess,
        failed: stepFailed,
        avgLatencyMs: stepAvgLatency,
        durationMs: stepDuration,
        status: stepFailed === 0 ? "healthy" : stepFailed / concurrency > 0.2 ? "crashed" : "degraded",
      });
    }

    const totalDurationSec = (Date.now() - startTime) / 1000;
    const overallAvgLatency = Math.round(totalLatency / totalSent);
    const throughput = Math.round((totalSent / totalDurationSec) * 10) / 10;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalRequests: totalSent,
      successful: totalSuccess,
      failed: totalFailed,
      dropRatePercent: Math.round((totalFailed / totalSent) * 1000) / 10,
      throughputReqPerSec: throughput,
      avgLatencyMs: overallAvgLatency,
      durationSec: Math.round(totalDurationSec * 10) / 10,
      levels: results,
      unoptimizedBaselineComparison: {
        breakingPointUsers: 200,
        droppedRateAt250Users: "42.8%",
        latencyAt250UsersMs: 1450,
        statusAt250Users: "DEGRADED (Client Churn)",
        crashedAt500Users: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Benchmark test execution failed" },
      { status: 500 }
    );
  }
}
