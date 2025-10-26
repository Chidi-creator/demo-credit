export interface CreditWalletPayload {
    account_number: string;
    amount: number;
    currency: string;
    description?: string;
}

export interface WithdrawToAccountPayload {
    bank_code: string; // Bank code
    account_number: string;
    amount: number;
    narration?: string;
    currency: string;
}