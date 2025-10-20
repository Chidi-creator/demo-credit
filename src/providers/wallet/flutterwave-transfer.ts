import logger from "@services/logger.service";
import { InitiateTransferRequest, InitiateTransferResponse } from "./types/transfer";
import axios from "axios";
import { env } from "@config/env";

class FlutterwaveTransferProvider {
  private static instance: FlutterwaveTransferProvider;
  private url: string;
  private apiKey: string;

  constructor() {
    this.url = "https://api.flutterwave.com/v3/transfers";
    this.apiKey = env.FLUTTERWAVE_SANDBOX_SECRET_KEY;
  } 

  public static getInstance(): FlutterwaveTransferProvider {
    if (!FlutterwaveTransferProvider.instance) {
      FlutterwaveTransferProvider.instance = new FlutterwaveTransferProvider();
    }
    return FlutterwaveTransferProvider.instance;
  }

  async initiateTransfer(
    request: InitiateTransferRequest
  ): Promise<InitiateTransferResponse> {
    try {
      console.log("=== FLUTTERWAVE TRANSFER REQUEST DEBUG ===");
      console.log("URL:", this.url);
      console.log("Request payload:", request);

      const response = await axios.post<InitiateTransferResponse>(
        this.url,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("=== END FLUTTERWAVE TRANSFER DEBUG ===");

      if (response.data.status !== "success") {
        logger.error(`Flutterwave Transfer API Error: ${response.data.message}`);
      }

      return response.data;
    } catch (error: any) {
      logger.error(`Flutterwave transfer error: ${error.message}`);
      if (error.response) {
        logger.error(`Flutterwave error response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

export default FlutterwaveTransferProvider;
