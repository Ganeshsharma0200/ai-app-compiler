"use client";

import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { evaluationPrompts } from "@/lib/eval/prompts";
import type { EvaluationResult } from "@/lib/types";

export function EvaluationTable() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runEvaluation = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Evaluation failed.");
      }

      setResult(payload as EvaluationResult);
    } catch (evaluationError) {
      setError(evaluationError instanceof Error ? evaluationError.message : "Evaluation failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const rows =
    result?.rows ??
    evaluationPrompts.map((prompt) => ({
      ...prompt,
      status: "pending" as const,
      repairAttempts: null,
      errors: [],
      warnings: [],
      latencyMs: null
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-ink">Evaluation Harness</h2>
          <p className="text-sm text-slate-600">Runs the deterministic compiler against 10 normal and 10 edge prompts.</p>
        </div>
        <button
          type="button"
          onClick={runEvaluation}
          disabled={isRunning}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isRunning ? "Running..." : "Run Evaluation"}
        </button>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard label="Total Prompts" value={result.summary.totalPrompts} />
          <MetricCard label="Success Rate" value={`${result.summary.successRate}%`} tone="success" />
          <MetricCard label="Avg Repairs" value={result.summary.averageRepairAttempts} />
          <MetricCard label="Avg Latency" value={`${result.summary.averageLatencyMs}ms`} />
          <MetricCard
            label="Failure Types"
            value={result.summary.commonFailureTypes[0] === "None" ? "None" : result.summary.commonFailureTypes.length}
            tone={result.summary.commonFailureTypes[0] === "None" ? "success" : "warning"}
          />
        </div>
      ) : null}

      {result ? (
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-ink">Common Failure Types</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.summary.commonFailureTypes.map((failure) => (
              <span key={failure} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {failure}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-[980px] text-sm">
            <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Prompt</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Repairs</th>
                <th className="px-4 py-3">Errors</th>
                <th className="px-4 py-3">Warnings</th>
                <th className="px-4 py-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="max-w-md px-4 py-3 text-slate-800">{row.prompt}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        row.status === "success"
                          ? "bg-green-100 text-green-800"
                          : row.status === "fail"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.repairAttempts ?? "--"}</td>
                  <td className="px-4 py-3 text-red-800">
                    {row.errors.length > 0 ? row.errors.join(" ") : result ? "None" : "--"}
                  </td>
                  <td className="px-4 py-3 text-amber-900">
                    {row.warnings.length > 0 ? row.warnings.join(" ") : result ? "None" : "--"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.latencyMs === null ? "--" : `${row.latencyMs}ms`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
