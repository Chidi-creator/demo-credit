import express from "express";
import BankHandler from "@handlers/bank.handler";

const router = express.Router();
const bankHandler = new BankHandler();

/**
 * @swagger
 * /banks:
 *   post:
 *     summary: Create a new bank
 *     description: Add a new bank to the system (admin only)
 *     tags: [Banks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the bank
 *               code:
 *                 type: string
 *                 description: Unique bank code
 *               country:
 *                 type: string
 *                 description: Country where the bank operates
 *               isActive:
 *                 type: boolean
 *                 description: Whether the bank is active
 *                 default: true
 *     responses:
 *       201:
 *         description: Bank created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bank'
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: Bank with this code already exists
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.route("/").post(bankHandler.createBank);

/**
 * @swagger
 * /banks/all:
 *   get:
 *     summary: Get all banks
 *     description: Retrieve a list of all available banks
 *     tags: [Banks]
 *     responses:
 *       200:
 *         description: List of banks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bank'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.route("/all").get(bankHandler.getAllBanks);

/**
 * @swagger
 * /banks/{id}:
 *   get:
 *     summary: Get bank by ID
 *     description: Retrieve a specific bank by its ID
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank ID
 *     responses:
 *       200:
 *         description: Bank details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bank'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.route("/:id").get(bankHandler.getBankById);

/**
 * @swagger
 * /banks/code/{code}:
 *   get:
 *     summary: Get bank by code
 *     description: Retrieve a specific bank by its unique code
 *     tags: [Banks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank code
 *     responses:
 *       200:
 *         description: Bank details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bank'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.route("/code/:code").get(bankHandler.getBankByCode);

export default router;
