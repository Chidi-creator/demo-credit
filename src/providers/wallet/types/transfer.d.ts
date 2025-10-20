export interface InitiateTransferRequest {
  account_bank: string; // Bank code
  account_number: string;
  amount: number;
  narration: string;
  currency: string;
  reference: string;
  callback_url?: string;
  debit_currency?: string;
}

export interface InitiateTransferResponse {
  status: string;
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: string;
    currency: string;
    debit_currency: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta: any;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: number;
    bank_name: string;
  };
}
