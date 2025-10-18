import express from "express";
import BankHandler from "@handlers/bank.handler";

const router = express.Router();
const bankHandler = new BankHandler();

router.route("/").post(bankHandler.createBank);
router.route("/all").get(bankHandler.getAllBanks);

router.route("/:id").get(bankHandler.getBankById);

router.route("/code/:code").get(bankHandler.getBankByCode);

export default router;
