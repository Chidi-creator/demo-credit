import VerificationHandler from "@handlers/verification.handler";
import express from "express";
import { AuthService } from "@services/auth.service";

const router = express.Router();
const verificationHandler = new VerificationHandler();
const authService = new AuthService();

/**
 * @swagger
 * /verification/submit-kyc:
 *   post:
 *     summary: Submit KYC verification documents
 *     description: Submit KYC (Know Your Customer) verification documents for user verification
 *     tags: [Verification]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *               - bvn
 *               - bvn_phone_number
 *               - dob
 *               - email
 *               - account_number
 *               - bank_code
 *               - state
 *               - lga
 *               - city
 *               - address
 *               - photo_url
 *               - documents
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *               bvn:
 *                 type: string
 *                 description: Document identification number
 *               bvn_phone_number:
 *                 type: string
 *                 description: phone number associated with bvn
 *               dob:
 *                 type: string
 *                 description: Date of birth
 *               email:
 *                 type: string
 *                 description: User's email address
 *               account_number:
 *                 type: string
 *                 description: User's account number
 *               bank_code:
 *                 type: string
 *                 description: User's bank code
 *               state:
 *                 type: string
 *                 description: Users state of origin
 *               lga:
 *                 type: string
 *                 description: Users local government area
 *               city:
 *                 type: string
 *                 description: Users city of residence
 *               address:
 *                 type: string
 *                 description: Users address
 *               photo_url:
 *                 type: string
 *                 format: binary
 *                 description: Selfie of the user holding the document
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: binary
 *                       description: Document image
 *                     type_id:
 *                       type: number
 *                       description: Document type ID
 *                     sub_type_id:
 *                       type: number
 *                       description: Document sub-type ID
 *     responses:
 *       200:
 *         description: KYC verificaton completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "KYC verification completed"
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       413:
 *         description: Request entity too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: 'error'
 *               message: 'File size too large. Maximum size is 5MB.'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.route("/submit-kyc").post(
  authService.auth,
  verificationHandler.submitKYCVerification
);

export default router;