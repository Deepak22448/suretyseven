import { ProcessorOutcome } from "@suretyseven/shared";
import { MAX_PROCESSING_ATTEMPTS } from "../documents.constants";

const RETRYABLE_OUTCOMES: ProcessorOutcome[] = ["TIMEOUT", "ERROR"];

export function isRetryable(outcome: ProcessorOutcome): boolean {
  return RETRYABLE_OUTCOMES.includes(outcome);
}

export function attemptsExhausted(attemptCount: number): boolean {
  return attemptCount >= MAX_PROCESSING_ATTEMPTS;
}

const TERMINAL_FAILURE_REASONS = {
  TIMEOUT_EXHAUSTED: "PROCESSOR_TIMEOUT_EXHAUSTED",
  ERROR_EXHAUSTED: "PROCESSOR_ERROR_EXHAUSTED",
  INVALID_RESULT: "PROCESSOR_INVALID_RESULT",
  UNKNOWN: "UNKNOWN",
} as const;
export type TerminalFailureReason = (typeof TERMINAL_FAILURE_REASONS)[keyof typeof TERMINAL_FAILURE_REASONS];

export function terminalReasonFor(outcome: ProcessorOutcome): TerminalFailureReason {
  switch (outcome) {
    case "TIMEOUT":
      return TERMINAL_FAILURE_REASONS.TIMEOUT_EXHAUSTED;
    case "ERROR":
      return TERMINAL_FAILURE_REASONS.ERROR_EXHAUSTED;
    case "INVALID_RESULT":
      return TERMINAL_FAILURE_REASONS.INVALID_RESULT;
    case "SUCCESS":
      // SUCCESS is never itself a failure reason; kept exhaustive for type safety.
      return TERMINAL_FAILURE_REASONS.UNKNOWN;
  }
}
