# AI Usage

## Tools

Claude Code (Anthropic): scaffolding, then an iterative build-and-review pass.

## What it built

Full stack: Prisma schema, Express backend (routes → controller → service →
repo layering, poller/claim/retry worker), Next.js frontend (Tailwind +
shadcn/ui), a shared Zod-schema package, Docker setup, test suite. Bonus
scope added post-core: in-page PDF preview, manual retry, filename search,
upload-date-range filtering.

## Decisions changed or rejected

- **Single Next.js app, rejected.** Proposed collapsing frontend+backend
  into one app; kept the assignment's `/backend` + `/frontend` split instead.
- **Turborepo + NestJS, rejected mid-build.** No payoff at 3 packages/one
  dev; NestJS would've rewritten already-working code for no functional gain
  on the parts that actually matter (claim query, retry policy, dedup are all
  plain TS/SQL regardless of framework).
- **CSS bug found by looking at the page, not the code.** Button text went
  invisible after the Tailwind v4 migration; the component code looked
  correct (`text-primary-foreground` was right there). Cause: an unlayered
  `a { color }` rule in `globals.css` beats any `@layer utilities` class
  regardless of specificity. Fixed by moving it into `@layer base`.
- **`window.confirm` replaced with a real `AlertDialog`.** Used it first for
  delete confirmation; it's a blocking native dialog and it actually caused a
  double-delete during my own browser testing. Swapped to shadcn's
  `AlertDialog`, which is non-blocking and consistent with the rest of the UI.
- **File preview: raw streaming rejected, base64 JSON kept.** First cut used
  `res.sendFile` with `Content-Disposition: inline`. Switched to returning
  `{filename, mimeType, data: base64}` so the frontend can embed it in an
  `<iframe>` inline on the detail page instead of only opening a new tab.
- **Manual retry's `attemptCount` handling, reversed.** First pass reset it
  to 0 on retry, reasoned as "a deliberate new attempt deserves a fresh
  budget." Wrong: that lets a human bypass `MAX_PROCESSING_ATTEMPTS` by just
  clicking retry repeatedly. Changed so a manual retry continues the same
  attempt count, buying exactly one more attempt rather than a new budget of 3.

## Self-directed review pass

Ran a slop-cleaner audit after the initial build: architecture held up (no
dead code, no needless abstraction, no boundary violations). One real
gap: `/documents/stats`, `sortOrder`, and pagination page 2+ had zero test
coverage. Closed it, and in the process found a bug in my own new test
(assumed the claim query would pick a specific document; it always claims
oldest-first).

Follow-up cleanup: trimmed stale/verbose comments, removed one genuinely
dead branch (`INTERNAL_API_URL`, since every data call runs client-side, so it
never executed), and replaced a few bare-`string` return/param types with
real shared enums (`SortOrder`, error codes, `TerminalFailureReason`) so a
typo fails to compile instead of shipping silently.

Ran a second scoped audit after adding manual retry + search/date filtering.
Found a real bug: the `dateTo` end-of-day boundary (`T23:59:59.999`) had no
UTC marker, so `new Date()` parsed it as server-local time while the bare
date on the other side of the range parsed as UTC. On this machine (IST,
UTC+5:30) that silently dropped any document uploaded in the last 5.5 hours
of the day from date-range results. One-character fix (`Z` suffix). The
original test didn't catch it: it only checked far-future/far-past
boundaries, never the actual edge, and only "passed" because it happened to
run in a timezone where the bug wasn't yet visible. Added a boundary-precise
test that pins `process.env.TZ` and plants a document at 23:00 UTC, and
confirmed it actually fails without the fix before relying on it.

## What I'd double check before the technical round

- The claim query (`backend/src/features/documents/worker/claim.ts`): one
  SQL statement for dispatch + retry backoff + crash recovery, and why it's
  only safe for multiple workers because of `SKIP LOCKED`.
- The retry policy (`backend/src/features/documents/worker/retryPolicy.ts`):
  why `INVALID_RESULT` and failed validation fail fast instead of retrying.
- Manual retry (`POST /documents/:id/retry`): why it continues the same
  `attemptCount` instead of resetting it, and why the endpoint itself is
  deliberately uncapped (a human deciding to retry again isn't the same
  failure mode `MAX_PROCESSING_ATTEMPTS` exists to stop).
- Postgres-over-SQLite and the 1M-docs/day answer, in README's Engineering
  Questions section.
