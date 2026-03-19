import { NextResponse } from "next/server";
import {
  getErrorDetails,
  getErrorMessage,
  getErrorStatusCode
} from "@/lib/utils/errors";

export function createApiErrorResponse(error: unknown) {
  return NextResponse.json(
    {
      error: getErrorMessage(error),
      details: getErrorDetails(error)
    },
    { status: getErrorStatusCode(error) }
  );
}
