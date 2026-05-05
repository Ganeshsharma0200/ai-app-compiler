import { NextResponse } from "next/server";
import { runEvaluation } from "@/lib/eval/runner";

export async function POST() {
  try {
    return NextResponse.json(runEvaluation());
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to run evaluation.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
