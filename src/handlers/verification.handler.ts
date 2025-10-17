import VerificationService from "@services/verification.service";
import { Request, Response } from "express";
import { responseManager } from "@managers/index";
import { AuthenticatedRequest } from "@services/types/auth";
import { KYCSubmissionData } from "@services/types/verification";
import { ValidationError } from "@managers/error.manager";
import { validateKYCSubmission } from "@validation/KYC";
import logger from "@services/logger.service";

class VerificationHandler {
  private verificationService: VerificationService;
  constructor() {
    this.verificationService = new VerificationService();
  }

  submitKYCVerification = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = Number(authReq.user?.id);

      if (!authReq.user || !authReq.user.id || isNaN(userId)) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const kycData: KYCSubmissionData = req.body;

      //validate request body
      const { error } = validateKYCSubmission(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const result = await this.verificationService.submitKYCVerification(
        userId,
        kycData
      );
      if (!result.success) {
        logger.error(
          `KYC verification failed for user ID: ${userId}, Reason: ${result.message}`
        );
        throw new ValidationError(result.message);
      }
      logger.info(
        `KYC verification completed for user ID: ${userId}, Can Onboard: ${result.canOnboard}`
      );
      return responseManager.success(
        res,
        { canOnboard: result.canOnboard, response: result.response },
        result.message
      );
    } catch (error: any) {
      responseManager.handleError(res, error);
    }
  };
}

export default VerificationHandler;
