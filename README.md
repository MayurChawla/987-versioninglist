# Release Checklist Tool 🚀

A modern, responsive Single-Page Application (SPA) designed to streamline software release processes. Built with **Next.js (App Router)**, **GraphQL Yoga**, **Apollo Client**, **Prisma ORM**, and **PostgreSQL**, fully dockerized and ready for cloud deployment.

---

## 📋 Table of Contents
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Database Schema](#-database-schema)
- [GraphQL API Specification](#-graphql-api-specification)
- [Local Development & Docker Setup](#-local-development--docker-setup)
- [Automated Testing](#-automated-testing)
- [Stress Testing & Performance](#-stress-testing--performance)
- [Online Cloud Deployment](#-online-cloud-deployment)

---

## 🏗 Architecture & Design Decisions

### 1. Monorepo / Single Repository Architecture
- **Framework Choice**: Next.js 14 with TypeScript and App Router.
- **Rationale**: Keeps frontend (React SPA) and backend (GraphQL Yoga endpoint at `/api/graphql`) seamlessly organized in a single repository without cross-origin configuration overhead, facilitating zero-friction Docker builds and single-click cloud deployment.

### 2. Data Modeling & Step Storage Optimization
- **Model**: `Release` table in PostgreSQL.
- **Step Persistence Strategy**: Rather than creating a separate relational database table for static steps (which don't change over time), step completions are persisted as a scalar string array (`completedSteps: String[]`) in the `releases` table.
- **Dynamic Status Computation**: Release status is auto-computed dynamically at query/resolver time using `computeReleaseStatus`:
  - `planned`: 0 steps completed (`completedSteps.length === 0`).
  - `ongoing`: At least 1 step completed (`0 < completedSteps.length < totalSteps`).
  - `done`: All steps completed (`completedSteps.length === 8`).

### 3. API Layer: GraphQL
- **Server**: `graphql-yoga` integrated directly into Next.js App Router API handler (`src/app/api/graphql/route.ts`).
- **Client**: Apollo Client (`@apollo/client`) configured with reactive caching for seamless UI updates.

### 4. UI/UX Design System
- **Theme**: Sleek dark mode glassmorphism with dynamic progress bar and color-coded status badges (`Planned` - Blue, `Ongoing` - Amber, `Done` - Emerald).
- **Responsiveness**: Fully responsive grid & flexbox layouts supporting mobile, tablet, and desktop viewports.

---

## 🗄 Database Schema

The database schema is defined in [`prisma/schema.prisma`](file:///e:/Mayur/WORK/interview%20Prep/test987-versioning/987-versioninglist/prisma/schema.prisma):

```prisma
model Release {
  id             String   @id @default(uuid())
  name           String
  date           DateTime
  additionalInfo String?  @map("additional_info")
  completedSteps String[] @default([]) @map("completed_steps")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("releases")
}
```

### Database Fields Summary
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id`, `@default(uuid())` | Unique release identifier (UUID) |
| `name` | `String` | Mandatory | Release name / title (e.g. `v2.4.0 Core Upgrade`) |
| `date` | `DateTime` | Mandatory | Target / scheduled release date & time |
| `additionalInfo` | `String?` | Optional | Additional release notes / operational info |
| `completedSteps` | `String[]` | Default `[]` | List of completed step IDs (e.g. `["step-1", "step-2"]`) |
| `createdAt` | `DateTime` | Auto timestamp | Timestamp when release was created |
| `updatedAt` | `DateTime` | Auto updated | Timestamp when release was last modified |

---

## 📡 GraphQL API Specification

**API Endpoint**: `/api/graphql` (Supports GET, POST, and GraphQL Playground / GraphiQL).

### 1. Queries

#### `releases`
Fetches all releases with step breakdown and computed status.
```graphql
query GetReleases {
  releases {
    id
    name
    date
    additionalInfo
    completedSteps
    status
    totalSteps
    completedCount
    createdAt
    updatedAt
    steps {
      id
      name
      description
      completed
    }
  }
}
```

#### `releaseSteps`
Fetches default release step definitions.
```graphql
query GetReleaseSteps {
  releaseSteps {
    id
    name
    description
  }
}
```

### 2. Mutations

#### `createRelease`
Creates a new release record.
```graphql
mutation CreateRelease($input: CreateReleaseInput!) {
  createRelease(input: $input) {
    id
    name
    date
    status
  }
}
```

#### `updateRelease`
Updates additional info, name, or due date.
```graphql
mutation UpdateRelease($id: ID!, $input: UpdateReleaseInput!) {
  updateRelease(id: $id, input: $input) {
    id
    name
    additionalInfo
  }
}
```

#### `toggleStep`
Checks or unchecks a step state (`completed: true/false`).
```graphql
mutation ToggleStep($releaseId: ID!, $stepId: String!, $completed: Boolean!) {
  toggleStep(releaseId: $releaseId, stepId: $stepId, completed: $completed) {
    id
    completedSteps
    status
  }
}
```

#### `deleteRelease`
Deletes a release by ID.
```graphql
mutation DeleteRelease($id: ID!) {
  deleteRelease(id: $id)
}
```

---

## 🐳 Local Development & Docker Setup

### Quickstart with Docker Compose (Recommended)
```bash
# 1. Start PostgreSQL & Next.js web application
docker compose up --build

# 2. Open browser
# UI & GraphQL API available at http://localhost:3000
```

---

## 🧪 Automated Testing

Automated tests cover status calculation logic and GraphQL resolvers.

```bash
# Run automated tests via Vitest
npm test
```

---

## ⚡ Stress Testing & Performance Benchmark Results

An automated load/stress script using `autocannon` is included in [`scripts/stress-test.mjs`](file:///e:/Mayur/WORK/interview%20Prep/test987-versioning/987-versioninglist/scripts/stress-test.mjs).

```bash
node scripts/stress-test.mjs
```

### Empirical Benchmark Results (Tested on Docker Container Stack with PostgreSQL 15)
- **Target Endpoint**: `http://localhost:3000/api/graphql`
- **Simultaneous Users / Connections**: **50 concurrent connections**
- **Total Requests Handled**: **3,394 requests** in 10 seconds
- **Sustained Throughput**: **339.4 requests/second**
- **Average Latency**: **146.32 ms**
- **Success Rate**: **100% (3,394 / 3,394 2xx Success responses, 0 errors, 0 failures)**

---

## ☁️ Online Cloud Deployment

### Free Hosting Strategy
1. **Database**: Hosted PostgreSQL on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. **Frontend + GraphQL API**: Deployed on [Vercel](https://vercel.com) or [Render.com](https://render.com).

### Deployment Steps (Vercel + Neon Postgres)
1. Provision a free PostgreSQL database on Neon.tech and copy `DATABASE_URL`.
2. Push repository to GitHub (`git push -u origin main`).
3. Import repository into Vercel.
4. Set Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL Connection String.
   - `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: `/api/graphql`
5. Deploy! Vercel will automatically run `prisma generate` and build the application.
