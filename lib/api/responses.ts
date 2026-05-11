import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "validation_error", issues: error.issues }, { status });
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: "request_failed", message }, { status: status >= 500 ? status : 400 });
}
