# AI Usage

> Draft written during development — read the code yourself before
> submitting, you'll be asked about this directly in the technical round.

## Tools

Claude Code (Anthropic) — scaffolding, then an iterative build-and-review pass.

## What it built

Full stack: Prisma schema, Express backend (routes → controller → service →
repo layering, poller/claim/retry worker), Next.js frontend (Tailwind +
shadcn/ui), a shared Zod-schema package, Docker setup, test suite.

## Decisions changed or rejected

- **Single Next.js app, rejected.** Proposed collapsing frontend+backend
  into one app; kept the assignment's `/backend` + `/frontend` split instead.
- **Turborepo + NestJS, rejected mid-build.** No payoff at 3 packages/one
  dev; NestJS would've rewritten already-working code for no functional gain
  on the parts that actually matter (claim query, retry policy, dedup — all
  plain TS/SQL regardless of framework).
- **Dependency versions corrected via `npm audit`.** multer 1.x (known CVEs)
  → 2.x; Next 14.2.15 (9 advisories incl. an RCE) → 16.x, after confirming
  React 18 stays a supported peer. Declined the audit's suggested vitest→5.x
  bump — needs Node ≥22, conflicts with the `node:20-alpine` image — and
  documented that as an accepted, inapplicable advisory instead of forcing it.
- **CSS bug found by looking at the page, not the code.** Button text went
  invisible after the Tailwind v4 migration; the component code looked
  correct (`text-primary-foreground` was right there). Cause: an unlayered
  `a { color }` rule in `globals.css` beats any `@layer utilities` class
  regardless of specificity. Fixed by moving it into `@layer base`.
- **`window.confirm` replaced with a real `AlertDialog`.** Used it first for
  delete confirmation; it's a blocking native dialog and it actually caused a
  double-delete during my own browser testing. Swapped to shadcn's
  `AlertDialog` — non-blocking, consistent with the rest of the UI.

## Self-directed review pass

Ran a slop-cleaner audit after the initial build: architecture held up (no
dead code, no needless abstraction, no boundary violations). One real
gap — `/documents/stats`, `sortOrder`, and pagination page 2+ had zero test
coverage — closed it, and in the process found a bug in my own new test
(assumed the claim query would pick a specific document; it always claims
oldest-first).

Follow-up cleanup: trimmed stale/verbose comments, removed one genuinely
dead branch (`INTERNAL_API_URL` — every data call runs client-side, so it
never executed), and replaced a few bare-`string` return/param types with
real shared enums (`SortOrder`, error codes, `TerminalFailureReason`) so a
typo fails to compile instead of shipping silently.

## What I'd double check before the technical round

- The claim query (`backend/src/features/documents/worker/claim.ts`) — one
  SQL statement for dispatch + retry backoff + crash recovery, and why it's
  only safe for multiple workers because of `SKIP LOCKED`.
- The retry policy (`backend/src/features/documents/worker/retryPolicy.ts`)
  — why `INVALID_RESULT` and failed validation fail fast instead of retrying.
- Postgres-over-SQLite and the 1M-docs/day answer — README's Engineering
  Questions section.
