"use client";

import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { FiLeadModal } from "./fi-lead-modal";
import { useUtmCapture } from "../hooks/use-utm-capture";

/**
 * PRD Module 1, Flow A & B. CTA 1 is a plain `<a>`/`Link` (no JS dependency,
 * per 1.4.1) to `/signup`; CTA 2 opens the FI lead form inline (AC-LND-002).
 */
export function Hero() {
  const [fiModalOpen, setFiModalOpen] = useState(false);
  useUtmCapture();

  return (
    <section className="bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="mb-4 inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          The Digital Mediator for B2B debt recovery
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          Turn outstanding invoices into recoverable cash — without burning the relationship
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-500">
          Oncre automates B2B debt recovery for Nigerian SMEs and financial institutions with a
          structured, empathetic 21-day recovery engine.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Start Recovering — It&apos;s Free to Join
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => setFiModalOpen(true)}>
            <Building2 className="h-4 w-4" />
            Contact Enterprise Sales
          </Button>
        </div>
      </div>

      <FiLeadModal open={fiModalOpen} onClose={() => setFiModalOpen(false)} />
    </section>
  );
}
