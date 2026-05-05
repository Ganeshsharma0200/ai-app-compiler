import { EvaluationTable } from "@/components/EvaluationTable";

export default function EvaluationPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Evaluation Metrics</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Compiler Evaluation</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Run the full compiler against a fixed suite of normal product prompts and edge cases. Results come from real
          `compileApp` executions.
        </p>
      </div>
      <EvaluationTable />
    </main>
  );
}
