import { KanbanBoard } from "@/features/dashboard/components/kanban-board";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-ink-900">Recovery dashboard</h1>
      <p className="mb-6 text-sm text-ink-500">Track every case through its 21-day recovery journey.</p>
      <KanbanBoard />
    </div>
  );
}
