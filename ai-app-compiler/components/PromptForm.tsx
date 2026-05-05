"use client";

import { useMemo, useState } from "react";
import { JsonViewer } from "@/components/JsonViewer";
import { MetricCard } from "@/components/MetricCard";
import { PipelineViewer } from "@/components/PipelineViewer";
import { RuntimePreview } from "@/components/RuntimePreview";
import { ValidationPanel } from "@/components/ValidationPanel";
import type { CompileResult, RepairLog } from "@/lib/types";

const examplePrompt =
  "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.";

type TabKey = "config" | "runtime" | "validation" | "pipeline";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "config", label: "Final Config" },
  { key: "runtime", label: "Runtime Preview" },
  { key: "validation", label: "Validation" },
  { key: "pipeline", label: "Pipeline Stages" }
];

function repairLogs(result: CompileResult): RepairLog[] {
  const repairStage = result.stages.find((stage) => stage.stage === "Repair");
  const output = repairStage?.output;

  if (
    output &&
    typeof output === "object" &&
    "logs" in output &&
    Array.isArray((output as { logs?: unknown }).logs)
  ) {
    return (output as { logs: RepairLog[] }).logs;
  }

  return [];
}

export function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<CompileResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("config");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logs = useMemo(() => (result ? repairLogs(result) : []), [result]);

  const generate = async () => {
    if (!prompt.trim()) {
      setError("Enter a software idea before generating.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Generation failed.");
      }

      setResult(payload as CompileResult);
      setActiveTab("config");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Natural Language Prompt</h2>
            <p className="mt-1 text-sm text-slate-600">
              The compiler converts this into validated app configuration using local deterministic stages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPrompt(examplePrompt)}
            className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:border-slate-400 hover:bg-mist"
          >
            Use example prompt
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the software idea you want to compile..."
          className="mt-4 min-h-36 w-full resize-y rounded-lg border border-line bg-mist p-4 text-sm text-ink outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

        {error ? (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={isLoading}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
          {result ? (
            <span className="text-sm text-slate-600">
              Last run: {result.metrics.latencyMs}ms, {result.metrics.repairAttempts} repair attempt(s)
            </span>
          ) : null}
        </div>
      </section>

      {result ? (
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-5">
            <MetricCard
              label="Status"
              value={result.metrics.success ? "Success" : "Fail"}
              tone={result.metrics.success ? "success" : "danger"}
            />
            <MetricCard label="Latency" value={`${result.metrics.latencyMs}ms`} />
            <MetricCard label="Repairs" value={result.metrics.repairAttempts} />
            <MetricCard label="Errors" value={result.metrics.errorCount} tone={result.metrics.errorCount ? "danger" : "success"} />
            <MetricCard
              label="Warnings"
              value={result.metrics.warningCount}
              tone={result.metrics.warningCount ? "warning" : "neutral"}
            />
          </div>

          <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-white p-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key ? "bg-ink text-white" : "text-slate-600 hover:bg-mist hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "config" ? <JsonViewer data={result.config} /> : null}
          {activeTab === "runtime" ? <RuntimePreview runtime={result.runtime} /> : null}
          {activeTab === "validation" ? (
            <div className="space-y-5">
              <ValidationPanel report={result.config.validationReport} />
              <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-ink">Repair Logs</h2>
                <div className="mt-3 space-y-3">
                  {logs.map((log) => (
                    <div key={`${log.attempt}-${log.action}-${log.detail}`} className="rounded-md border border-line p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Attempt {log.attempt} - {log.action}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{log.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
          {activeTab === "pipeline" ? <PipelineViewer stages={result.stages} /> : null}
        </section>
      ) : null}
    </div>
  );
}
