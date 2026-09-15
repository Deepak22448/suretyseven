<img width="1469" height="838" alt="Screenshot 2026-09-15 at 12 17 55 PM" src="https://github.com/user-attachments/assets/4d69e0ca-1b0a-47c1-a17a-b58a611252e2" />


# Document Processing Pipeline

SDE-1 take-home for SuretySeven. A document upload/async-processing/status
service with a web UI, per `SuretySeven_SDE1_Assignment.pdf`.

## Stack

- **Backend**: Node.js + TypeScript, Express, Multer, Zod, Prisma, pino (structured logging)
- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui (Radix primitives)
- **DB**: Postgres
- **Shared types**: `/shared`, Zod schemas consumed by both backend and
  frontend via npm workspaces (see [Engineering Questions](#engineering-questions))

## Run it

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Postgres migrations run automatically on backend container start
  (`prisma migrate deploy`, see `backend/Dockerfile`).

### Local dev (without Docker)

```bash
npm install                      # installs all 3 workspaces
npm run build --workspace=shared # compiles the shared Zod-schema package
cp backend/.env.example backend/.env
# start a local Postgres, then create the DB (see backend/.env.example)
cd backend && npx prisma migrate dev
npm run dev --workspace=backend  # http://localhost:4000
npm run dev --workspace=frontend # http://localhost:3000 (separate terminal)
```

### Tests

```bash
npm install
# a Postgres instance must be reachable at $DATABASE_URL (defaults to the
# docker-compose one on localhost:5432)
npm test
```

Runs the required scenarios: valid upload, non-PDF rejection, successful
processing, processor failure, failure-then-successful-retry, retry
exhaustion, and duplicate-upload detection. See `/tests`.

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/documents` | Upload a PDF (`file`, `documentType`, optional `metadata`) |
| GET | `/documents/:id` | Status + extracted result |
| GET | `/documents/:id/history` | Full status timeline |
| GET | `/documents/:id/file` | Returns the stored file as base64 JSON, for in-page preview |
| GET | `/documents?status=&documentType=&filename=&dateFrom=&dateTo=&page=&pageSize=&sortOrder=` | List, filtered (status/type/filename substring/upload date range) + paginated + sorted |
| GET | `/documents/stats` | Counts by status, for the dashboard tiles |
| POST | `/documents/:id/retry` | Manually retries a `FAILED`/`VALIDATION_FAILED` document, resetting it to `UPLOADED` and continuing the same attempt count |
| DELETE | `/documents/:id` | Deletes a document, its history, and its stored file |

## Deliverable layout note

The assignment's suggested `/docs/architecture.png` is `/docs/architecture.md`
instead: a Mermaid diagram that renders natively on GitHub (and in most
Markdown viewers) with no image-export tooling required. Content is the same;
format is a deliberate substitution.

## Explicitly skipped / stubbed

These are intentional scope cuts, not gaps I didn't notice:

- **Real OCR/AI extraction**: mocked per the assignment (`backend/src/features/documents/worker/processor.ts`);
  swapping in a real extractor means replacing that one module behind the same
  `{ outcome, fields }` return shape.
- **External queue** (Redis/BullMQ/SQS): an in-process poller is enough for a
  single-instance app; add a queue when running more than one worker replica.
- **S3/object storage**: local disk volume; first thing to change for real scale.
- **Auth/authz, rate limiting, malware scanning**: not requested, out of
  scope for a mocked pipeline.
- **Per-document-type configurable validation rules**: the assignment's 4
  rules are hardcoded (`backend/src/features/documents/validation/extraction.validation.ts`).
- **Exponential backoff+jitter**: flat 3s retry delay; there's no real
  rate-limited dependency behind the mock processor to protect.
- **Websockets/SSE**: status updates are polling-based (2s interval on the
  frontend while a document is active) rather than push-based. The bonus
  items that *are* built: in-page PDF preview, filename search, upload-date
  range filtering, manual retry, and dashboard counts (`GET /documents/stats`,
  real counts, not a client-side approximation).

## Engineering Questions

**Why this architecture?** A single Express process serves the REST API and
runs an in-process `setInterval` poller in the same event loop. They only
communicate through Postgres, never directly, via function calls. That
coupling-through-the-database (rather than direct calls) is what would let
API and poller become genuinely independent later, restarting on their own
schedules once split into separate processes or replicas, without any code
change to the retry/crash-recovery logic. Today they still live in one
process, so this is a design property this architecture enables, not
something it does yet. It avoids running/operating a separate worker process
or an external queue for a take-home-scale workload, while still leaving a
clean seam (the claim query in `backend/src/features/documents/worker/claim.ts`)
to swap in a real queue and multiple workers later.

**Why this database?** Postgres, not SQLite: the claim query needs row-level
locking (`SELECT ... FOR UPDATE SKIP LOCKED`) to let multiple workers claim
different documents concurrently without blocking each other or double-claiming
the same row. SQLite has no row-level locking and no `FOR UPDATE` syntax at
all, so this specific mechanism isn't portable to it. Duplicate detection
(a unique constraint on `contentHash`, with the resulting conflict error
caught and treated as "already exists") would work identically on either
database; that part of the design isn't Postgres-specific. See
`backend/src/features/documents/worker/claim.ts`.

**How does asynchronous processing work?** Upload writes a `Document` row
with `status = UPLOADED` and returns immediately. A poller ticks every ~1s
and runs one atomic claim query that picks the oldest claimable row (see
below), flips it to `PROCESSING`, and hands it to the mock processor. The
API and the poller never call each other directly.

**How do retries work?** `TIMEOUT`/`ERROR` are retried (assumed transient,
infra-shaped) up to `MAX_PROCESSING_ATTEMPTS = 3` total, with a flat 3s backoff between
attempts. `INVALID_RESULT` fails fast: it's not transient, the processor itself
couldn't use these bytes, and retrying won't change that. A `SUCCESS` outcome
whose extracted fields fail validation also fails fast into a distinct
`VALIDATION_FAILED` status rather than being retried as if it were a
processing error, since it's a data-quality problem with the source document,
not a transient failure. See `backend/src/features/documents/worker/retryPolicy.ts`.
On top of the automatic mechanism, `POST /documents/:id/retry` lets a human
manually retry a terminal `FAILED`/`VALIDATION_FAILED` document; it continues
the same attempt count instead of resetting it, and the endpoint has no cap of
its own since `MAX_PROCESSING_ATTEMPTS` exists to stop the poller looping
forever, not to limit a person's judgment call.

**How do you prevent duplicate processing?** SHA-256 of the uploaded file
bytes is stored as a unique `contentHash`. A duplicate upload is detected
before a new `Document` row is ever created, so it never enters the poller's
claim query at all: duplicate prevention happens at upload time, not by
de-duping in-flight processing.

**What happens if the application crashes during processing?** The exact
same claim query that implements retry backoff also implements crash
recovery, with no separate code path: a document claimed into `PROCESSING`
that never got a terminal update (because the process died mid-attempt)
looks, from the query's point of view, identical to a document waiting out
its retry backoff. Both are `PROCESSING` rows with a stale `updatedAt`.
Once that staleness threshold passes, the row becomes claimable again.
`attemptCount` is incremented at claim time (not at completion time), so a
crash-and-reclaim still counts toward `MAX_PROCESSING_ATTEMPTS` and can't loop forever.

**What would you change for 1M documents/day?** ~12 docs/sec average, spikier
in practice. A single in-process poller doing one claim per tick is the
first bottleneck. The claim query is already safe for multiple concurrent
workers (`FOR UPDATE SKIP LOCKED` means two pollers can never claim the same
row), so the first move is running several worker replicas against the same
claim query, no logic change needed. Beyond that: move file storage off the
local disk volume to S3 (the current local volume doesn't scale or survive a
container replacement), partition `Document` by `createdAt` and add read
replicas for the list/history endpoints, and if poller-tick throughput itself
becomes the ceiling, graduate from polling to a push-based queue (Postgres
`LISTEN/NOTIFY` first, a real broker if that's not enough).

**Biggest limitations of this implementation?**
- Single poller instance, no horizontal scaling wired up yet (though the
  claim query already supports it).
- Local disk file storage: not shared across replicas, not durable at scale.
- No auth: anyone with network access can upload/read documents.
- Polling-based status updates on the frontend (2s interval while a document
  is active) rather than push-based (SSE/websocket): simple, but not
  instant.
- Validation rules are hardcoded for the 4 fields in the spec, not
  configurable per document type.
