import VerificationHandler from "@handlers/verification.handler";
import express from "express";
import { AuthService } from "@services/auth.service";

const router = express.Router();
const verificationHandler = new VerificationHandler();
const authService = new AuthService();

router.route("/submit-kyc").post(
  authService.auth,
  verificationHandler.submitKYCVerification
);

export default router;