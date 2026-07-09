import "server-only";

import { NextResponse } from "next/server";

import { BackendAuthError, BackendBusinessError, BackendUnavailableError } from "./staff-backend";
import { StaffAuthError } from "./staff-session";

/** Mirrors the app's one `ApiEnvelope` shape regardless of which of the backend's two failure shapes actually fired. */
export function jsonSuccess<T>(data: T, message = "OK", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function jsonError(error: unknown) {
  if (error instanceof StaffAuthError || error instanceof BackendAuthError) {
    return NextResponse.json({ success: false, message: error.message, data: null }, { status: error.status });
  }

  if (error instanceof BackendBusinessError) {
    return NextResponse.json({ success: false, message: error.message, data: null }, { status: 400 });
  }

  if (error instanceof BackendUnavailableError) {
    return NextResponse.json({ success: false, message: error.message, data: null }, { status: 502 });
  }

  console.error(error);
  return NextResponse.json({ success: false, message: "Something went wrong", data: null }, { status: 500 });
}
