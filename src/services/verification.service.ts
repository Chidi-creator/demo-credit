import axios from "axios";
import { env } from "@config/env";
import UserUseCases from "@usecases/user.usecase";
import { KYCSubmissionData } from "./types/verification";
import { IUser } from "@models/user";
import { ValidationError, VerificationError } from "@managers/error.manager";


interface AdjuitorApiResponse {
  status: string;
  message: string;
  data: Record<string, any>;
}

class VerificationService {
  private userUseCases: UserUseCases;
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.userUseCases = new UserUseCases();
    this.apiUrl = "https://adjutor.lendsqr.com/v2/customers";
    this.apiKey = env.ADJUITOR_API_KEY;
  }

  /**
   * Submit KYC data to external API and handle response
   */
  async submitKYCVerification(
    userId: number,
    kycData: KYCSubmissionData
  ): Promise<{
    success: boolean;
    canOnboard: boolean;
    response: AdjuitorApiResponse | null;
    message: string;
  }> {
    try {
      const apiResponse = await this.callKYCAPI(kycData);

      const canOnboard = this.canUserBeOnboarded(apiResponse);

      if (canOnboard) {
        await this.updateUserWithKYCResponse(userId, apiResponse);
      }

      if (!canOnboard) {
        const updateData: Partial<IUser> = {
          is_blacklisted: true,
        };
        await this.userUseCases.update(userId, updateData);
      }
      return {
        success: true,
        canOnboard,
        response: apiResponse,
        message: canOnboard
          ? "KYC verification successful"
          : "User cannot be onboarded due to blacklisting issues",
      };
    } catch (error: any) {
      console.error("KYC verification failed:", error);

      return {
        success: false,
        canOnboard: false,
        response: null,
        message: error.message || "KYC verification failed",
      };
    }
  }

  //call adjuitor api
  private async callKYCAPI(
    kycData: KYCSubmissionData
  ): Promise<AdjuitorApiResponse> {
    const response = await axios.post<AdjuitorApiResponse>(
      this.apiUrl,
      kycData,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status !== "success") {
      throw new VerificationError(response.data.message || "KYC API call failed", "500");
    }

    return response.data;
  }

  //update user with adjuitor api response
  private async updateUserWithKYCResponse(
    userId: number,
    apiResponse: AdjuitorApiResponse
  ): Promise<void> {
    const updateData: Partial<IUser> = {
      is_verified: true,
      first_name: apiResponse.data.user.first_name,
      last_name: apiResponse.data.user.last_name,
    };

    await this.userUseCases.update(userId, updateData);
  }

  private canUserBeOnboarded(apiResponse: AdjuitorApiResponse): boolean {
    //check if user is blacklisted
    if (apiResponse.data.user.blacklist > 0) {
      return false;
    }

    return true;
  }


}

export default VerificationService;
