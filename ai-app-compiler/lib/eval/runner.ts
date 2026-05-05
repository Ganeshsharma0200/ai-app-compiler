import { evaluationPrompts } from "@/lib/eval/prompts";
import { compileApp } from "@/lib/pipeline/compiler";
import type { EvaluationResult, EvaluationRow } from "@/lib/types";

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const commonFailureTypes = (rows: EvaluationRow[]) => {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    row.errors.forEach((error) => {
      const normalized = error.replace(/"[^"]+"/g, '"<value>"');
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return ["None"];
  }

  return sorted.slice(0, 5).map(([error, count]) => `${error} (${count})`);
};

export function runEvaluation(): EvaluationResult {
  const rows: EvaluationRow[] = evaluationPrompts.map((item) => {
    const result = compileApp(item.prompt);

    return {
      id: item.id,
      category: item.category,
      prompt: item.prompt,
      status: result.metrics.success ? "success" : "fail",
      repairAttempts: result.metrics.repairAttempts,
      errors: result.config.validationReport.errors,
      warnings: result.config.validationReport.warnings,
      latencyMs: result.metrics.latencyMs
    };
  });

  const successCount = rows.filter((row) => row.status === "success").length;

  return {
    rows,
    summary: {
      totalPrompts: rows.length,
      successRate: Math.round((successCount / rows.length) * 100),
      averageRepairAttempts: Number(average(rows.map((row) => row.repairAttempts)).toFixed(2)),
      averageLatencyMs: Number(average(rows.map((row) => row.latencyMs)).toFixed(2)),
      commonFailureTypes: commonFailureTypes(rows)
    }
  };
}
