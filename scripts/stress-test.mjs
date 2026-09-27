import autocannon from "autocannon";

const targetUrl = process.env.TEST_URL || "http://localhost:3000/api/graphql";

const query = JSON.stringify({
  query: `
    query GetReleases {
      releases {
        id
        name
        status
        completedCount
        steps {
          id
          name
          completed
        }
      }
    }
  `,
});

console.log(`Starting stress test against ${targetUrl}...`);

const instance = autocannon(
  {
    url: targetUrl,
    connections: 50, // Concurrent connections
    duration: 10,   // Test duration in seconds
    pipelining: 1,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: query,
  },
  (err, result) => {
    if (err) {
      console.error("Stress test failed:", err);
      process.exit(1);
    }
    console.log("\n================ STRESS TEST RESULTS ================");
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Total Requests: ${result.requests.total}`);
    console.log(`Requests/sec: ${result.requests.average}`);
    console.log(`Latency Average: ${result.latency.average} ms`);
    console.log(`Throughput Average: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/sec`);
    console.log(`2xx Responses: ${result["2xx"]}`);
    console.log(`Non-2xx Responses: ${result.non2xx || 0}`);
    console.log(`Errors / Failures: ${result.errors}`);
    console.log("====================================================\n");
  }
);

autocannon.track(instance, { renderProgressBar: true });
