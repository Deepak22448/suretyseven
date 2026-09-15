import { ProcessorOutcome, RawExtractedResult } from "@suretyseven/shared";
import { MOCK_PROCESSING_DELAY_MS } from "../documents.constants";

export type ProcessorResult = {
  outcome: ProcessorOutcome;
  fields?: RawExtractedResult;
};

const SAMPLE_COMPANIES = [
  { companyName: "ABC Construction Pvt Ltd", registrationNumber: "U12345DL2020PTC123456" },
  { companyName: "Vertex Infra Ltd", registrationNumber: "U45678MH2019PTC098765" },
  { companyName: "Skyline Builders Pvt Ltd", registrationNumber: "U98765DL2021PTC554433" },
];

// Weighted so SUCCESS is common but every failure mode is exercised in normal use.
const OUTCOME_WEIGHTS: [ProcessorOutcome, number][] = [
  ["SUCCESS", 60],
  ["TIMEOUT", 15],
  ["ERROR", 15],
  ["INVALID_RESULT", 10],
];

function pickWeighted(): ProcessorOutcome {
  const total = OUTCOME_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [outcome, weight] of OUTCOME_WEIGHTS) {
    if (roll < weight) return outcome;
    roll -= weight;
  }
  return "SUCCESS";
}

function fakeExtraction(): RawExtractedResult {
  const company = SAMPLE_COMPANIES[Math.floor(Math.random() * SAMPLE_COMPANIES.length)];
  // Occasionally corrupt a SUCCESS so VALIDATION_FAILED is actually reachable.
  const corrupt = Math.random() < 0.2;
  return {
    companyName: corrupt ? "" : company.companyName,
    registrationNumber: company.registrationNumber,
    address: "New Delhi",
    annualRevenue: corrupt ? -50_000 : Math.floor(Math.random() * 50_000_000),
    documentDate: "2026-08-15",
  };
}

// Test-only seam — queued results are consumed in order instead of rolling randomly,
// so retry/validation tests are deterministic. Never populated in prod.
let queuedResults: ProcessorResult[] = [];
export function queueMockResults(results: ProcessorResult[]) {
  queuedResults = [...results];
}
export function clearMockResults() {
  queuedResults = [];
}

// This is the seam a real OCR/AI extractor would replace — same return shape.
export function runMockProcessor(): Promise<ProcessorResult> {
  if (queuedResults.length > 0) {
    return Promise.resolve(queuedResults.shift()!);
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const outcome = pickWeighted();
      resolve({
        outcome,
        fields: outcome === "SUCCESS" ? fakeExtraction() : undefined,
      });
    }, MOCK_PROCESSING_DELAY_MS);
  });
}
