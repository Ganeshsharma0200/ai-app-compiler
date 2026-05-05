# AI App Compiler with Config Runtime Engine

## Problem Statement

AI App Compiler converts a natural language software idea into a strict, validated, executable app configuration. The goal is to demonstrate system thinking around LLM-style output control: extracting intent, designing a system, generating a schema-backed contract, validating it, repairing local defects, simulating runtime execution, and measuring quality.

The MVP runs without any AI API key. It uses deterministic local generation so demos are repeatable, cheap, and reliable. The code is structured so an AI provider can be added later behind the same pipeline interface.

## Architecture Diagram

```text
Natural Language Prompt
  -> Intent Extraction
  -> System Design Layer
  -> Schema Generation
  -> Zod Schema Validation
  -> Cross-Layer Validator
  -> Targeted Repair Engine
  -> Config Runtime Preview
  -> Evaluation Metrics
```

## Why This Is Not a Prompt Wrapper

A prompt wrapper asks a model for JSON and hopes the response is usable. This project uses compiler-style stages with typed intermediate artifacts:

- Intent extraction detects app type, features, entities, roles, vague requirements, conflicts, and assumptions.
- System design converts intent into roles, pages, entities, flows, and assumptions.
- Schema generation emits the strict AppConfig contract, including UI layouts, API validation fields, database tables, and database relations.
- Validation enforces both shape and cross-layer consistency.
- Repair patches specific defects instead of regenerating everything.
- Runtime simulation proves that pages, APIs, database tables, and permissions line up.
- Evaluation runs a fixed suite and reports real success, latency, warnings, errors, and repair attempts.

## Pipeline Explanation

1. `extractIntent(prompt)` classifies the prompt into a product domain and normalized intent.
2. `designSystem(intent)` turns intent into app design primitives.
3. `generateSchemas(design)` creates database tables, relations, API endpoints with request/response validation, UI pages with layout metadata, auth, permissions, and business logic.
4. `validateConfig(config)` runs Zod and semantic cross-layer checks.
5. `repairConfig(config, validationResult)` applies targeted repairs for missing pages, roles, tables, IDs, billing, analytics, and auth.
6. `simulateRuntime(config)` builds an execution preview from the final config.
7. `compileApp(prompt)` orchestrates the full pipeline and emits metrics.

## Validation and Repair

Validation has two layers:

- Zod validates required fields, enum values, arrays, object structure, and strict JSON shape.
- Cross-layer validation checks that endpoint tables exist, endpoint validation fields match database fields, page APIs exist, roles exist, permissions reference known roles, tables have IDs, table relations point to real fields, protected pages have auth, billing has plans, and analytics has both API and page coverage.

Repair is intentionally targeted. It does not blindly regenerate the app. It can add missing Login or Dashboard pages, add unknown roles, create minimal missing tables, add missing `id` fields, sync endpoint validation from table schemas, repair relation tables/fields, remove unknown page API references, add billing support, add analytics support, and configure auth for protected pages. Repair is capped at 3 attempts.

## Runtime Preview

The runtime preview maps:

- UI pages to connected APIs
- API endpoints to database tables
- API request/response validation contracts to table fields
- Database tables to fields
- Database relations to source and target fields
- Roles to pages and endpoints

If validation errors remain, the preview marks the config as not executable and returns the blocking issues.

## Evaluation Framework

The `/evaluation` page runs 20 prompts:

- 10 normal product prompts
- 10 edge cases

For each prompt, the app reports success/fail status, repair attempts, errors, warnings, and latency. Summary cards calculate total prompts, success rate, average repairs, average latency, and common failure types from real compiler outputs.

## Cost vs Quality Tradeoff

The deterministic generator has zero API cost, no network dependency, and stable output for internship demos. The tradeoff is that interpretation is heuristic rather than model-grade. A future AI adapter can improve language understanding while keeping the same strict schema, validator, repair engine, runtime preview, and evaluation harness.

## How to Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional checks:

```bash
npm run typecheck
npm run build
```

## Deploy on Vercel

1. Push the `ai-app-compiler` folder to a Git repository.
2. Import the project in Vercel.
3. Use the default Next.js settings.
4. No environment variables are required for the MVP.
5. Deploy.

## Project Structure

```text
ai-app-compiler/
├─ app/
│  ├─ page.tsx
│  ├─ evaluation/page.tsx
│  ├─ layout.tsx
│  ├─ globals.css
│  └─ api/
│     ├─ generate/route.ts
│     └─ evaluate/route.ts
├─ components/
│  ├─ PromptForm.tsx
│  ├─ PipelineViewer.tsx
│  ├─ JsonViewer.tsx
│  ├─ ValidationPanel.tsx
│  ├─ RuntimePreview.tsx
│  ├─ EvaluationTable.tsx
│  └─ MetricCard.tsx
├─ lib/
│  ├─ pipeline/
│  │  ├─ compiler.ts
│  │  ├─ intent.ts
│  │  ├─ designer.ts
│  │  ├─ schema-generator.ts
│  │  ├─ validator.ts
│  │  ├─ repair.ts
│  │  └─ runtime.ts
│  ├─ schemas/
│  │  └─ app-config.schema.ts
│  ├─ eval/
│  │  ├─ prompts.ts
│  │  └─ runner.ts
│  └─ types.ts
├─ README.md
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
└─ .env.example
```

## Future Improvements

- Add constrained LLM decoding.
- Add real app code generation.
- Add DB migration generation.
- Add OpenAPI generation.
- Add test generation.
