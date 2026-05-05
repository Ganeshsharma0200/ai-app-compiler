import { JsonViewer } from "@/components/JsonViewer";
import type { RepairLog, StageResult } from "@/lib/types";

interface PipelineViewerProps {
  stages: StageResult[];
}

function isRepairOutput(output: unknown): output is { logs: RepairLog[]; attempts: number } {
  return Boolean(
    output &&
      typeof output === "object" &&
      "logs" in output &&
      Array.isArray((output as { logs?: unknown }).logs)
  );
}

export function PipelineViewer({ stages }: PipelineViewerProps) {
  return (
    <section className="space-y-4">
      {stages.map((stage, index) => (
        <article key={stage.stage} className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stage {index + 1}
              </p>
              <h3 className="text-lg font-semibold text-ink">{stage.stage}</h3>
            </div>
            {isRepairOutput(stage.output) ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {stage.output.attempts} attempt(s)
              </span>
            ) : null}
          </div>

          {isRepairOutput(stage.output) ? (
            <div className="mt-4 space-y-3">
              {stage.output.logs.map((log) => (
                <div key={`${log.attempt}-${log.action}-${log.detail}`} className="rounded-md border border-line p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Attempt {log.attempt} - {log.action}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{log.detail}</p>
                </div>
              ))}
              <JsonViewer data={stage.output} />
            </div>
          ) : (
            <div className="mt-4">
              <JsonViewer data={stage.output} />
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
