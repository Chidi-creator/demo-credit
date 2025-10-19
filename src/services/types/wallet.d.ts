export interface CreditWalletPayload {
    account_number: string;
    amount: number;
    currency: string;
    description?: string;
}