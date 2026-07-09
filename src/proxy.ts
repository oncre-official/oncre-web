import { NextRequest, NextResponse } from "next/server";

import { env } from "@/config/env";
import { PortalAccountStatus } from "@/types/portal";

interface PortalSessionCookiePayload {
  token: string;
  status: PortalAccountStatus;
}

function readPortalSession(request: NextRequest): PortalSessionCookiePayload | null {
  const raw = request.cookies.get(env.sessionCookieName)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalSessionCookiePayload;
  } catch {
    return null;
  }
}

function redirectWithNotice(request: NextRequest, path: string, notice: string) {
  const url = new URL(path, request.url);
  url.searchParams.set("notice", notice);
  return NextResponse.redirect(url);
}

/**
 * Guards the staff console. Unlike the merchant-portal branch below, this
 * only checks "is a staff session cookie present at all" — per-role page
 * access is enforced once, in `src/lib/utils/staff-permissions.ts` (checked
 * server-side per page and re-checked by every `/api/staff/**` route
 * handler against the real backend), not duplicated here.
 */
function guardStaffConsole(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasStaffSession = !!request.cookies.get(env.staffSessionCookieName)?.value;
  const isLoginPage = pathname === "/staff/login";

  if (!hasStaffSession && !isLoginPage) return redirectWithNotice(request, "/staff/login", "staff-auth-required");
  if (hasStaffSession && isLoginPage) return NextResponse.redirect(new URL("/staff", request.url));
  return NextResponse.next();
}

/**
 * Guards the self-serve Merchant Portal (AC-KAN-002 / AC-KAN-003). Reads
 * only the session cookie (never the in-memory store, which relies on
 * Node's `crypto.scryptSync` and isn't guaranteed available on the Edge
 * runtime this proxy executes under).
 */
function guardMerchantPortal(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = readPortalSession(request);

  if (!session) return redirectWithNotice(request, "/login", "auth-required");

  switch (session.status) {
    case PortalAccountStatus.PENDING_PAYMENT:
      return redirectWithNotice(request, "/signup/verify", "verify-required");
    case PortalAccountStatus.SUSPENDED:
      return redirectWithNotice(request, "/login", "suspended");
    case PortalAccountStatus.VERIFIED_PENDING_PAYMENT:
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding/upload")) {
        return redirectWithNotice(request, "/onboarding/activate", "activate-required");
      }
      return NextResponse.next();
    case PortalAccountStatus.ACTIVE:
      if (pathname.startsWith("/onboarding/activate")) {
        return NextResponse.redirect(new URL("/onboarding/upload", request.url));
      }
      return NextResponse.next();
    default:
      return NextResponse.next();
  }
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/staff")) return guardStaffConsole(request);
  return guardMerchantPortal(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/staff/:path*"],
};
