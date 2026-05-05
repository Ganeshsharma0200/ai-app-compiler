import { NextResponse } from "next/server";
import { z } from "zod";
import { compileApp } from "@/lib/pipeline/compiler";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required.")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.issues.map((issue) => issue.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(compileApp(parsed.data.prompt));
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to compile prompt.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
