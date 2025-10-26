import logger from "@services/logger.service";
import { InitiateWithdrawalRequest, InitiateTransferResponse } from "./types/transfer";
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

  async InitiateWithdrawal(
    request: InitiateWithdrawalRequest
  ): Promise<InitiateTransferResponse> {
    try {
      logger.info("Making Flutterwave withdrawal request", { request });

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

      logger.info("Response status:", { status: response.status });
      logger.info("Response data:", { data: response.data });


      if (response.data.status !== "success") {
        logger.error(`Flutterwave Withdrawal API Error: ${response.data.message}`);
      }

      return response.data;
    } catch (error: any) {
      logger.error(`Flutterwave withdrawal error: ${error.message}`);
      if (error.response) {
        logger.error(`Flutterwave error response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

export default FlutterwaveTransferProvider;
