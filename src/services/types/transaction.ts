export interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    amount: number;
    currency: string;
    status: "successful" | "failed" | "pending";
    narration: string;
    account_reference: string;
    sender_name: string;
    sender_bank: string;
    reference: string;
    date_created: string; // ISO timestamp
  };
}
