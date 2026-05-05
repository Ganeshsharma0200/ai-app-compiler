import { PromptForm } from "@/components/PromptForm";

const architectureItems = [
  {
    title: "Multi-stage compiler pipeline",
    body: "The app separates intent extraction, system design, schema generation, validation, repair, runtime simulation, and metrics. Each stage emits inspectable intermediate output."
  },
  {
    title: "Why stage-wise generation",
    body: "Stage boundaries reduce uncontrolled output. The design layer can reason in product terms while the schema layer focuses on strict executable contracts."
  },
  {
    title: "Validation",
    body: "Zod enforces required fields, arrays, strict object shapes, and enum values. A cross-layer validator checks table references, API validation fields, relations, API usage, roles, auth, analytics, and billing consistency."
  },
  {
    title: "Repair",
    body: "The repair engine applies targeted patches such as adding missing core pages, creating missing tables, fixing unknown roles, and wiring analytics or billing support."
  },
  {
    title: "Runtime preview",
    body: "The config runtime maps pages to APIs, endpoint validation to table fields, APIs to tables, table relations, and roles to accessible surfaces. It only marks the preview executable when validation passes."
  },
  {
    title: "Cost vs quality tradeoff",
    body: "The MVP runs locally with deterministic heuristics for zero API cost and repeatable demos. A future AI adapter can improve interpretation while keeping the same schema and repair guardrails."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Config Runtime Engine</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink sm:text-5xl">AI App Compiler</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Convert a natural language software idea into a strict, validated, executable app configuration with
              deterministic local generation, targeted repair, runtime awareness, and evaluation metrics.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-mist p-5">
            <h2 className="text-lg font-semibold text-ink">Pipeline</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>Natural Language Prompt</p>
              <p>Intent Extraction</p>
              <p>System Design Layer</p>
              <p>Schema Generation</p>
              <p>Validation and Repair</p>
              <p>Config Runtime Preview</p>
              <p>Evaluation Metrics</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PromptForm />
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Architecture</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Not a Prompt Wrapper</h2>
            <p className="mt-3 text-slate-600">
              The system treats generation like compilation. It creates typed intermediate artifacts, validates the
              final contract, repairs local defects, and simulates execution before reporting success.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {architectureItems.map((item) => (
              <article key={item.title} className="rounded-lg border border-line bg-mist p-5">
                <h3 className="font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
