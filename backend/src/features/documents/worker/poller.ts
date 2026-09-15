import { logger } from "../../../lib/logger";
import { POLL_INTERVAL_MS, MAX_PROCESSING_ATTEMPTS } from "../documents.constants";
import { claimNextDocument } from "./claim";
import { runMockProcessor } from "./processor";
import { isRetryable, attemptsExhausted, terminalReasonFor } from "./retryPolicy";
import { validateExtraction } from "../validation/extraction.validation";
import { recordEvent } from "../documents.repo";

// Prevents overlapping ticks and double-starting the poller on hot reload.
let isRunning = false;
let intervalHandle: NodeJS.Timeout | null = null;

async function processClaimedDocument(doc: { id: string; attemptCount: number }) {
  const result = await runMockProcessor();
  const { outcome, fields } = result;

  if (outcome === "SUCCESS" && fields) {
    const check = validateExtraction(fields);
    if (check.valid) {
      await recordEvent({
        documentId: doc.id,
        eventStatus: "PROCESSED",
        attemptNumber: doc.attemptCount,
        outcome,
        updateAggregate: { status: "PROCESSED", extractedResult: fields, failureReason: null },
      });
      logger.info(
        { documentId: doc.id, attemptNumber: doc.attemptCount, status: "PROCESSED" },
        "document processed",
      );
      return;
    }
    const reason = `Validation failed: ${check.errors.join("; ")}`;
    await recordEvent({
      documentId: doc.id,
      eventStatus: "VALIDATION_FAILED",
      attemptNumber: doc.attemptCount,
      outcome,
      reason,
      extractedSnapshot: fields,
      updateAggregate: { status: "VALIDATION_FAILED", extractedResult: fields, failureReason: reason },
    });
    logger.warn(
      { documentId: doc.id, attemptNumber: doc.attemptCount, status: "VALIDATION_FAILED", reason },
      "document validation failed",
    );
    return;
  }

  // Non-SUCCESS outcome (TIMEOUT / ERROR / INVALID_RESULT).
  const canRetry = isRetryable(outcome) && !attemptsExhausted(doc.attemptCount);
  if (canRetry) {
    // Aggregate status stays PROCESSING — the claim query's staleness check will retry it.
    await recordEvent({
      documentId: doc.id,
      eventStatus: "FAILED",
      attemptNumber: doc.attemptCount,
      outcome,
      reason: `Attempt ${doc.attemptCount}/${MAX_PROCESSING_ATTEMPTS} failed (${outcome}), will retry`,
    });
    logger.warn(
      { documentId: doc.id, attemptNumber: doc.attemptCount, outcome },
      "processing attempt failed, will retry",
    );
    return;
  }

  const reason = terminalReasonFor(outcome);
  await recordEvent({
    documentId: doc.id,
    eventStatus: "FAILED",
    attemptNumber: doc.attemptCount,
    outcome,
    reason,
    updateAggregate: { status: "FAILED", failureReason: reason },
  });
  logger.error(
    { documentId: doc.id, attemptNumber: doc.attemptCount, status: "FAILED", reason },
    "document processing failed terminally",
  );
}

// Exported so tests can drive one cycle directly instead of waiting on setInterval.
export async function runOnce() {
  if (isRunning) return;
  isRunning = true;
  try {
    const doc = await claimNextDocument();
    if (doc) {
      logger.info({ documentId: doc.id, attemptNumber: doc.attemptCount }, "claimed document");
      await processClaimedDocument(doc);
    }
  } catch (err) {
    logger.error({ err }, "poller tick failed");
  } finally {
    isRunning = false;
  }
}

export function startPoller() {
  if (intervalHandle) return; // already running (hot-reload guard)
  intervalHandle = setInterval(runOnce, POLL_INTERVAL_MS);
  logger.info({ intervalMs: POLL_INTERVAL_MS }, "poller started");
}
