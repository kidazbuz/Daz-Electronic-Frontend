

export interface ExpensePayload {
  amount: number;
  description: string;
  payment_method: string;
  category_id?: number;
  new_category?: { name: string };
  payee_id?: number;
  new_payee?: {
    payee_name: string;
    phone_number?: string;
    address?: {
      region_id: string;
      district_id?: string;
      ward_id?: string;
      street_id?: string;
      post_code?: string;
    };
  };
}


export interface IAddress {
    id: number;
    region: string;
    district: string;
    ward: string;
    street: string;
    post_code: string;
    street_prominent_name: string;
}


export interface IPayee {
    id: number;
    name: string;
    phone_number: string;
    address: IAddress;
}

export interface ICategory {
    id: number;
    name: string;
    description: string;
}


export interface IExpense {
    id: number;
    expense_date: string;
    amount: string;
    description: string;
    payment_method: 'Cash' | 'Mobile Money' | 'Card' | string;
    category: ICategory;
    payee: IPayee;
}

export interface IExpensePaginationResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: IExpense[];
}
