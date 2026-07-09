import { ActivationCard } from "@/features/onboarding/components/activation-card";
import { StepIndicator } from "@/features/auth/components/step-indicator";

export default function ActivatePage() {
  return (
    <div className="mx-auto max-w-lg">
      <StepIndicator current={2} />
      <ActivationCard />
    </div>
  );
}
