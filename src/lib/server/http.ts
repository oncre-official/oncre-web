import "server-only";

import { NextResponse } from "next/server";

import { PortalError } from "./portal-store";

/** Mirrors the real backend's `{ success, message, data }` envelope (src/handlers/responses). */
export function jsonSuccess<T>(data: T, message = "OK", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function jsonError(error: unknown) {
  if (error instanceof PortalError) {
    return NextResponse.json({ success: false, message: error.message, data: null }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ success: false, message: "Something went wrong", data: null }, { status: 500 });
}
