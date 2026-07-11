/** Mirrors oncre-backend `DashboardSummary` (src/app/dashboard/types/dashboard.interface.ts). */
export interface DashboardKpiSummary {
  total_active_cases: number;
  total_recovered_this_month: number;
  cases_in_call_queue_today: number;
  passive_cases: number;
}

export interface PaymentPipelineBucket {
  count: number;
  total: number;
}

export interface DashboardPaymentPipeline {
  received: PaymentPipelineBucket;
  pending: PaymentPipelineBucket;
  missed: PaymentPipelineBucket;
}

export interface UpcomingPayment {
  installment_id: string;
  case_id: string;
  debtor_name: string;
  amount: number;
  due_date: string;
}

export interface DashboardSummary {
  kpis: DashboardKpiSummary;
  payment_pipeline?: DashboardPaymentPipeline;
  upcoming_payments?: UpcomingPayment[];
  generated_at: string;
}
