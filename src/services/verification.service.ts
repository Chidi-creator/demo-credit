import axios from "axios";
import { env } from "@config/env";
import UserUseCases from "@usecases/user.usecase";
import { KYCSubmissionData } from "./types/verification";
import { IUser } from "@models/user";
import WalletService from "./wallet.service";
import { CreateWalletRequest } from "@providers/wallet/types/wallet";
import logger from "./logger.service";

interface AdjuitorApiResponse {
  status: string;
  message: string;
  data: Record<string, any>;
}

class VerificationService {
  private walletService: WalletService;
  private userUseCases: UserUseCases;

  constructor() {
    this.userUseCases = new UserUseCases();
    this.walletService = new WalletService();
  }

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
      const response = await axios.post(
        "https://adjutor.lendsqr.com/v2/customers",
        kycData,
        {
          headers: {
            Authorization: `Bearer ${env.ADJUITOR_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const apiResponse = response.data;

      const canOnboard = this.canUserBeOnboarded(apiResponse);
      if (canOnboard) {
        await this.updateUserWithKYCResponseAndCreateWallet(
          userId,
          apiResponse,
          kycData
        );
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
          ? "KYC verification and wallet creation successful"
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

  //update user with adjuitor api response
  private async updateUserWithKYCResponseAndCreateWallet(
    userId: number,
    apiResponse: AdjuitorApiResponse,
    kycData: KYCSubmissionData
  ): Promise<void> {
    logger.info(`Updating user ID: ${userId} with KYC response and creating wallet.`);
    const updateData: Partial<IUser> = {
      is_verified: true,
      first_name: apiResponse.data.user.first_name,
      last_name: apiResponse.data.user.last_name,
      user_bvn: kycData.bvn
    };
    const walletData: CreateWalletRequest = {
      email: kycData.email,
      currency: 'NGN',
      is_permanent: true,
      firstname: apiResponse.data.user.first_name,
      lastname: apiResponse.data.user.last_name,
      tx_ref: this.walletService.generateTxRef(userId),
      bank_code:'232',
      bvn: kycData.bvn,
    };
   await this.walletService.callWalletCreationApi(walletData, userId);
    await this.userUseCases.update(userId, updateData);
    logger.info(`User ID: ${userId} updated and wallet creation successful.`);
  }

  private canUserBeOnboarded(apiResponse: AdjuitorApiResponse): boolean {
    if (apiResponse.data.user.blacklist > 0) {
      return false;
    }

    return true;
  }
}

export default VerificationService;
