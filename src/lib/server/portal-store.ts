import "server-only";

import {
  BusinessType,
  PortalAccount,
  PortalAccountStatus,
  RegisterPortalAccountInput,
} from "@/types/portal";
import { CreateFiLeadInput, FiLead, FiLeadStatus } from "@/types/fi-lead";
import { PaymentStatus, PaymentType } from "@/types/payment";
import { SourcedCase } from "@/types/portal";

import { generateLeadId, generateMerchantId, generateOtp, generatePaymentReference } from "./id";
import { hashPassword, verifyPassword } from "./password";

/**
 * Process-memory store standing in for the self-serve merchant identity and
 * case ledger the real oncre-backend does not model yet (see
 * docs/BACKEND_INTEGRATION.md). Cached on `globalThis` so Next.js dev-mode
 * Fast Refresh doesn't wipe it between route-handler invocations.
 */

interface AccountRecord extends PortalAccount {
  password_hash: string;
  /** The real backend's own merchant_id (e.g. MER-00007), learned the first time a
   *  case for this account is persisted through `getBackendClient()`. */
  backend_merchant_id?: string;
  /** The real backend's own JWT for this account, captured on register-verify/login.
   *  Never exposed to the browser — used server-side to call real-backend endpoints
   *  (e.g. activation payment) on the merchant's own behalf. */
  backend_token?: string;
}

interface OtpRecord {
  code: string;
  expires_at: number;
  attempts: number;
  last_sent_at: number;
  locked: boolean;
}

interface PaymentRecord {
  reference: string;
  merchant_id: string;
  status: PaymentStatus;
  amount_kobo: number;
  type: PaymentType;
}

interface BulkJobRecord {
  job_id: string;
  merchant_id: string;
  total: number;
  valid: number;
  invalid: number;
  cases_created: SourcedCase[];
  errors: { row: number; column: string; message: string }[];
  created_at: number;
}

interface PortalStoreShape {
  accountsById: Map<string, AccountRecord>;
  accountsByEmail: Map<string, string>;
  otps: Map<string, OtpRecord>;
  sessions: Map<string, string>;
  cases: Map<string, SourcedCase[]>;
  payments: Map<string, PaymentRecord>;
  bulkJobs: Map<string, BulkJobRecord>;
  fiLeads: Map<string, FiLead>;
  fiLeadAttemptsByIp: Map<string, number[]>;
}

const globalForStore = globalThis as unknown as { __oncrePortalStore?: PortalStoreShape };

export const store: PortalStoreShape =
  globalForStore.__oncrePortalStore ??
  (globalForStore.__oncrePortalStore = {
    accountsById: new Map(),
    accountsByEmail: new Map(),
    otps: new Map(),
    sessions: new Map(),
    cases: new Map(),
    payments: new Map(),
    bulkJobs: new Map(),
    fiLeads: new Map(),
    fiLeadAttemptsByIp: new Map(),
  });

export class PortalError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
  }
}

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;
const FI_LEAD_RATE_LIMIT = 5;
const FI_LEAD_RATE_WINDOW_MS = 15 * 60 * 1000;
const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];

/* ------------------------------------------------------------------ */
/* Registration & OTP (PRD 2.3 Sub-flow A)                             */
/* ------------------------------------------------------------------ */

export function registerAccount(input: RegisterPortalAccountInput): { account: PortalAccount; otp: string } {
  const email = input.email.trim().toLowerCase();
  if (store.accountsByEmail.has(email)) {
    throw new PortalError("An account with this email already exists. Log in instead.", "EMAIL_TAKEN", 409);
  }

  const merchant_id = generateMerchantId();
  const record: AccountRecord = {
    merchant_id,
    full_name: input.full_name.trim(),
    business_name: input.business_name.trim(),
    business_type: input.business_type as BusinessType,
    email,
    phone: input.phone,
    status: PortalAccountStatus.PENDING_PAYMENT,
    created_at: new Date().toISOString(),
    password_hash: hashPassword(input.password),
  };

  store.accountsById.set(merchant_id, record);
  store.accountsByEmail.set(email, merchant_id);

  const otp = issueOtp(merchant_id);

  return { account: toPublicAccount(record), otp };
}

function issueOtp(merchant_id: string): string {
  const code = generateOtp();
  store.otps.set(merchant_id, {
    code,
    expires_at: Date.now() + OTP_TTL_MS,
    attempts: 0,
    last_sent_at: Date.now(),
    locked: false,
  });
  return code;
}

export function resendOtp(merchant_id: string): string {
  const existing = store.otps.get(merchant_id);
  if (existing && Date.now() - existing.last_sent_at < OTP_RESEND_COOLDOWN_MS) {
    throw new PortalError("Please wait before requesting another code.", "OTP_COOLDOWN", 429);
  }
  return issueOtp(merchant_id);
}

export function verifyOtp(merchant_id: string, code: string): PortalAccount {
  const account = store.accountsById.get(merchant_id);
  if (!account) throw new PortalError("Account not found.", "ACCOUNT_NOT_FOUND", 404);

  const otp = store.otps.get(merchant_id);
  if (!otp || otp.locked) throw new PortalError("Request a new verification code.", "OTP_INVALID", 400);

  if (Date.now() > otp.expires_at) {
    throw new PortalError("Your code has expired. Request a new one.", "OTP_EXPIRED", 400);
  }

  if (otp.code !== code) {
    otp.attempts += 1;
    if (otp.attempts >= OTP_MAX_ATTEMPTS) otp.locked = true;
    throw new PortalError("The code you entered is incorrect.", "OTP_INVALID", 400);
  }

  store.otps.delete(merchant_id);
  account.status = PortalAccountStatus.VERIFIED_PENDING_PAYMENT;

  return toPublicAccount(account);
}

/* ------------------------------------------------------------------ */
/* Session & login                                                     */
/* ------------------------------------------------------------------ */

export function login(value: string, password: string): { account: PortalAccount; token: string } {
  const merchant_id = store.accountsByEmail.get(value.trim().toLowerCase());
  const account = merchant_id ? store.accountsById.get(merchant_id) : undefined;
  if (!account || !verifyPassword(password, account.password_hash)) {
    throw new PortalError("Incorrect email or password.", "INVALID_CREDENTIALS", 400);
  }

  const token = createSession(account.merchant_id);
  return { account: toPublicAccount(account), token };
}

export function createSession(merchant_id: string): string {
  const token = `portal_${crypto.randomUUID()}`;
  store.sessions.set(token, merchant_id);
  return token;
}

export function destroySession(token: string): void {
  store.sessions.delete(token);
}

export function getAccountByToken(token: string | undefined): PortalAccount | null {
  if (!token) return null;
  const merchant_id = store.sessions.get(token);
  if (!merchant_id) return null;
  const account = store.accountsById.get(merchant_id);
  return account ? toPublicAccount(account) : null;
}

export function getAccountById(merchant_id: string): PortalAccount | null {
  const account = store.accountsById.get(merchant_id);
  return account ? toPublicAccount(account) : null;
}

export function getAccountByEmail(email: string): PortalAccount | null {
  const merchant_id = store.accountsByEmail.get(email.trim().toLowerCase());
  return merchant_id ? getAccountById(merchant_id) : null;
}

/**
 * Bridges a *real* backend-registered account into the same shadow shape the
 * rest of the portal already reads via `getAccountByToken`/`getAccountById`
 * — the session cookie, dashboard, and onboarding pages all resolve through
 * `store.accountsById` regardless of whether the underlying identity lives
 * only here (mock) or is also real in Mongo (see docs/BACKEND_INTEGRATION.md).
 * `password_hash` is a random, never-checked placeholder: real accounts
 * always authenticate against the real backend's own `/auth/login`, never
 * against this store's `verifyPassword`.
 */
export function upsertBackendShadowAccount(
  account: Omit<PortalAccount, "activated_at"> & { activated_at?: string },
  backendToken?: string,
): void {
  const existing = store.accountsById.get(account.merchant_id);
  const record: AccountRecord = {
    ...account,
    password_hash: existing?.password_hash ?? hashPassword(crypto.randomUUID()),
    backend_token: backendToken ?? existing?.backend_token,
  };
  store.accountsById.set(account.merchant_id, record);
  store.accountsByEmail.set(account.email.toLowerCase(), account.merchant_id);
}

export function getBackendMerchantId(merchant_id: string): string | undefined {
  return store.accountsById.get(merchant_id)?.backend_merchant_id;
}

export function recordBackendMerchantId(merchant_id: string, backendMerchantId: string): void {
  const account = store.accountsById.get(merchant_id);
  if (account) account.backend_merchant_id = backendMerchantId;
}

export function getBackendToken(merchant_id: string): string | undefined {
  return store.accountsById.get(merchant_id)?.backend_token;
}

/** Mutates the record in place so unrelated fields (backend_token, password_hash) survive. */
export function markAccountActivated(merchant_id: string): PortalAccount {
  const account = store.accountsById.get(merchant_id);
  if (!account) throw new PortalError("Account not found.", "ACCOUNT_NOT_FOUND", 404);

  account.status = PortalAccountStatus.ACTIVE;
  account.activated_at = new Date().toISOString();

  return toPublicAccount(account);
}

function toPublicAccount(record: AccountRecord): PortalAccount {
  const { password_hash, backend_merchant_id, backend_token, ...rest } = record;
  void password_hash;
  void backend_merchant_id;
  void backend_token;
  return rest;
}

/* ------------------------------------------------------------------ */
/* Activation paywall (PRD 2.3 Sub-flow B)                              */
/* ------------------------------------------------------------------ */

export function initiateActivation(merchant_id: string): { reference: string; amount_kobo: number } {
  const account = store.accountsById.get(merchant_id);
  if (!account) throw new PortalError("Account not found.", "ACCOUNT_NOT_FOUND", 404);

  const reference = generatePaymentReference();
  store.payments.set(reference, {
    reference,
    merchant_id,
    status: PaymentStatus.PENDING,
    amount_kobo: 500_000,
    type: PaymentType.ACTIVATION,
  });

  return { reference, amount_kobo: 500_000 };
}

export function completeActivation(reference: string): PortalAccount {
  const payment = store.payments.get(reference);
  if (!payment) throw new PortalError("Unknown payment reference.", "PAYMENT_NOT_FOUND", 404);

  const account = store.accountsById.get(payment.merchant_id);
  if (!account) throw new PortalError("Account not found.", "ACCOUNT_NOT_FOUND", 404);

  if (payment.status === PaymentStatus.PAID) return toPublicAccount(account);

  payment.status = PaymentStatus.PAID;
  account.status = PortalAccountStatus.ACTIVE;
  account.activated_at = new Date().toISOString();

  return toPublicAccount(account);
}

/* ------------------------------------------------------------------ */
/* Cases (PRD 2.3 Sub-flow C & D)                                       */
/* ------------------------------------------------------------------ */

export function addCases(merchant_id: string, cases: SourcedCase[]): void {
  const existing = store.cases.get(merchant_id) ?? [];
  store.cases.set(merchant_id, [...existing, ...cases]);
}

export function listCases(merchant_id: string): SourcedCase[] {
  return store.cases.get(merchant_id) ?? [];
}

export function findCase(merchant_id: string, case_id: string): SourcedCase | undefined {
  return listCases(merchant_id).find((c) => c.case_id === case_id);
}

export function createBulkJob(job: BulkJobRecord): void {
  store.bulkJobs.set(job.job_id, job);
}

export function getBulkJob(job_id: string): BulkJobRecord | undefined {
  return store.bulkJobs.get(job_id);
}

/* ------------------------------------------------------------------ */
/* FI leads (PRD Module 1)                                             */
/* ------------------------------------------------------------------ */

export function isFreeEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && FREE_EMAIL_DOMAINS.includes(domain);
}

export function checkFiLeadRateLimit(ip: string): void {
  const now = Date.now();
  const attempts = (store.fiLeadAttemptsByIp.get(ip) ?? []).filter((t) => now - t < FI_LEAD_RATE_WINDOW_MS);
  if (attempts.length >= FI_LEAD_RATE_LIMIT) {
    throw new PortalError("Too many submissions. Please try again later.", "RATE_LIMITED", 429);
  }
  attempts.push(now);
  store.fiLeadAttemptsByIp.set(ip, attempts);
}

export function createFiLead(input: CreateFiLeadInput, botSuspected: boolean): FiLead {
  const lead: FiLead = {
    id: generateLeadId(),
    ...input,
    status: FiLeadStatus.NEW,
    bot_suspected: botSuspected,
    created_at: new Date().toISOString(),
  };
  store.fiLeads.set(lead.id, lead);
  return lead;
}
