import { AuthService } from "@services/auth.service";
import express from "express";
import BlacklistedMiddleware from "@middleware/blacklisted.middleware.auth";
import AccountHandler from "@handlers/account.handler";

const router = express.Router();
const authService = new AuthService();
const accountHandler = new AccountHandler();
const blacklistedMiddleware = new BlacklistedMiddleware();

/**
 * @swagger
 * /accounts/create:
 *   post:
 *     summary: Create a new bank account
 *     description: Creates a new bank account for the authenticated user by using flutterwave to resolve user bank details and create it in the database
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_number:
 *                 type: string
 *                 description: User's account number
 *               bank_code:
 *                 type: string
 *                 description: User's bank code
 *             required:
 *               - account_number
 *               - bank_code
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/create")
  .post(
    [authService.auth, blacklistedMiddleware.handle],
    accountHandler.createAccount
  );

/**
 * @swagger
 * /accounts/user/{userId}:
 *   get:
 *     summary: Get accounts by user ID
 *     description: Retrieves all accounts associated with the specified user
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose accounts to retrieve
 *     responses:
 *       200:
 *         description: List of user accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       401:
 *         $ref: '#/components/responses/401'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router
  .route("/user/:userId")
  .get(
    [authService.auth, blacklistedMiddleware.handle],
    accountHandler.findUserAccountsById
  );

export default router;
