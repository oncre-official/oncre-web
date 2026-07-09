export const site = {
  name: "Oncre",
  tagline: "The Digital Mediator for B2B debt recovery",
  supportEmail: "enterprise@oncre.co",
  salesEmail: "sales@oncre.co",
} as const;

export const kanbanPhases = [
  {
    key: "PHASE_1",
    title: "Automated Outreach",
    subtitle: "Days 1-7 · SMS reminders",
  },
  {
    key: "PHASE_2",
    title: "Escalated Engagement",
    subtitle: "Days 8-14 · Recovery calls",
  },
  {
    key: "PHASE_3",
    title: "Final Notice",
    subtitle: "Days 15-21 · Escalation stage",
  },
  {
    key: "RESOLVED",
    title: "Resolved / Monitoring",
    subtitle: "Paid & monitoring-track cases",
  },
] as const;

export type KanbanPhaseKey = (typeof kanbanPhases)[number]["key"];
