import express from "express";
import { AuthService } from "@services/auth.service";
import BlacklistedMiddleware from "@middleware/blacklisted.middleware.auth";
import WalletHandler from "@handlers/wallet.handler";

const router = express.Router();
const walletHandler = new WalletHandler();
const authService = new AuthService();
const blacklistedMiddleware = new BlacklistedMiddleware();

/**
 * @swagger
 * /wallet/transfer:
 *   post:
 *     summary: Transfer funds between wallets
 *     description: Transfer funds from one wallet to another within the system
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_number
 *               - amount
 *               - currency
 *             properties:
 *               account_number:
 *                 type: string
 *                 description: Destination account number
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Amount to transfer (must be greater than 0)
 *               currency:
 *                 type: string
 *                 description: Currency code (should be NGN)
 *               description:
 *                 type: string
 *                 description: Optional Description of the transfer
 *     responses:
 *       200:
 *         description: Wallet transaction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/transfer")
  .post(
    [authService.auth, blacklistedMiddleware.handle],
    walletHandler.handleWalletTransaction
  );

/**
 * @swagger
 * /wallet/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet
 *     description: Withdraw funds from user's wallet to a bank account
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_bank
 *               - account_number
 *               - amount
 *               - currency
 *             properties:
 *               account_bank:
 *                 type: string
 *                 description: Bank code of the recipient's account
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Amount to withdraw
 *               currency:
 *                 type: string
 *                 description: Currency code (should be NGN)
 *               narration:
 *                 type: string
 *                 description: Description of the withdrawal 
 *     responses:
 *       200:
 *         description: Withdrawal initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/withdraw")
  .post(
    [authService.auth, blacklistedMiddleware.handle],
    walletHandler.handleWalletWithdrawal
  );

export default router;
