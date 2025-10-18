import axios from "axios";
import { env } from "@config/env";
import { VerificationError } from "@managers/error.manager";

export interface AdjuitorApiResponse {
  status: string;
  message: string;
  data: Record<string, any>;
}

class AdjuitorClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = "https://adjutor.lendsqr.com/v2/customers";
    this.apiKey = env.ADJUITOR_API_KEY;
  }

  async submitKYC(body: any): Promise<AdjuitorApiResponse> {
    try {
      const response = await axios.post<AdjuitorApiResponse>(this.apiUrl, body, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status !== "success") {
        throw new VerificationError(response.data.message || "KYC API call failed", "PROVIDER_ERROR");
      }

      return response.data;
    } catch (err: any) {
      throw new VerificationError(err.message || "KYC provider request failed", "PROVIDER_ERROR", err);
    }
  }

  // singleton helper
  private static _instance: AdjuitorClient | null = null;
  static getInstance() {
    if (!AdjuitorClient._instance) AdjuitorClient._instance = new AdjuitorClient();
    return AdjuitorClient._instance;
  }
}

export default AdjuitorClient.getInstance();
