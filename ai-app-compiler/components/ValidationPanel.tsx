import type { ValidationReport } from "@/lib/types";

interface ValidationPanelProps {
  report: ValidationReport;
}

export function ValidationPanel({ report }: ValidationPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Validation Report</h2>
          <p className="text-sm text-slate-600">Strict schema checks plus cross-layer consistency rules.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            report.valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {report.valid ? "Valid" : "Invalid"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-line p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Repair Attempts</p>
          <p className="mt-1 text-2xl font-bold text-ink">{report.repairAttempts}</p>
        </div>
        <div className="rounded-md border border-line p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Errors</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{report.errors.length}</p>
        </div>
        <div className="rounded-md border border-line p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Warnings</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{report.warnings.length}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Errors</h3>
          {report.errors.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {report.errors.map((error) => (
                <li key={error} className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              No validation errors.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Warnings</h3>
          {report.warnings.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {report.warnings.map((warning) => (
                <li
                  key={warning}
                  className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                >
                  {warning}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-md border border-line bg-mist p-3 text-sm text-slate-600">
              No warnings.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
