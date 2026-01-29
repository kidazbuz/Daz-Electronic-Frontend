export interface SaleItem {
  id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  unit_measure: string;
  model: string;
}

export interface PaymentRecord {
  id: number;
  date_paid: string;
  amount: string;
  method: string;
  reference_id: string;
}

export interface SaleRecord {
  id: number;
  sale_date: string;
  total_amount: string;
  status: string;
  payment_method: string;
  payment_status: string;
  amount_paid: string;
  balance_due: string;
  customer: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  items: SaleItem[];
  payments: PaymentRecord[];
}

export interface IAgentSummaryData {
    sales_count: number;
    revenue: string | number;
    cash_received: string | number;
    momo_received: string | number;
    total_expenses: string | number;
    net_cash_on_hand: string | number;
    new_credit_issued: string | number;
}

export interface IAgentSummaryResponse {
    agent_name: string;
    date: string;
    is_closed: boolean;
    summary: IAgentSummaryData;
}
