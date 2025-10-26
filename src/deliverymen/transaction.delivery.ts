import TransactionHandler from "@handlers/transaction.handler";
import express from "express";

const router = express.Router();
const transactionHandler = new TransactionHandler();

/**
 * @swagger
 * /transactions/webhook/flutterwave/deposit:
 *   post:
 *     summary: Flutterwave deposit webhook
 *     description: Webhook endpoint for processing Flutterwave deposit notifications PAYLOAD IS SENT BY FLUTTERWAVE, NOT USERS. USERS ARE ASSIGNED ACCOUNT NUMBERS AND BANKS WHICH THEY SEND MONEY TO FROM THEIR BANK APP.
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Type of event (e.g., charge.completed)
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     description: Transaction ID
 *                   tx_ref:
 *                     type: string
 *                     description: Transaction reference
 *                   amount:
 *                     type: number
 *                     description: Transaction amount
 *                   currency:
 *                     type: string
 *                     description: Transaction currency
 *                   status:
 *                     type: string
 *                     description: Transaction status
 *                   customer:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   meta:
 *                     type: object
 *                     description: Additional metadata
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *                   example: "Webhook received and processed"
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.route("/webhook/flutterwave").post(transactionHandler.HandleWebhook);

export default router;
