import { Suspense } from "react";

import { Footer } from "@/features/landing/components/footer";
import { Hero } from "@/features/landing/components/hero";
import { Navbar } from "@/features/landing/components/navbar";
import { PersonasSection } from "@/features/landing/components/personas-section";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense>
          <Hero />
        </Suspense>
        <PersonasSection />
      </main>
      <Footer />
    </div>
  );
}
