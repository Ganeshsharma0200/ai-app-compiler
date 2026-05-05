import { designSystem } from "@/lib/pipeline/designer";
import { extractIntent } from "@/lib/pipeline/intent";
import { repairConfig } from "@/lib/pipeline/repair";
import { generateSchemas } from "@/lib/pipeline/schema-generator";
import { simulateRuntime } from "@/lib/pipeline/runtime";
import { validateConfig } from "@/lib/pipeline/validator";
import type { CompileResult, StageResult } from "@/lib/types";

export function compileApp(prompt: string): CompileResult {
  const startedAt = Date.now();
  const stages: StageResult[] = [];

  const intent = extractIntent(prompt);
  stages.push({ stage: "Intent Extraction", output: intent });

  const design = designSystem(intent);
  stages.push({ stage: "System Design", output: design });

  const generatedConfig = generateSchemas(design);
  stages.push({ stage: "Schema Generation", output: generatedConfig });

  const initialValidation = validateConfig(generatedConfig);
  stages.push({ stage: "Validation", output: initialValidation });

  const repair = repairConfig(generatedConfig, initialValidation);
  stages.push({
    stage: "Repair",
    output: {
      attempts: repair.attempts,
      logs: repair.logs,
      validation: repair.validation
    }
  });

  const runtime = simulateRuntime(repair.config);
  stages.push({ stage: "Runtime Simulation", output: runtime });

  const latencyMs = Date.now() - startedAt;
  const finalValidation = repair.config.validationReport;

  return {
    prompt,
    stages,
    config: repair.config,
    runtime,
    metrics: {
      success: finalValidation.valid && runtime.executable,
      latencyMs,
      repairAttempts: finalValidation.repairAttempts,
      errorCount: finalValidation.errors.length,
      warningCount: finalValidation.warnings.length
    }
  };
}
