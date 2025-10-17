import AuthHandler from "@handlers/auth.handler";
import express from "express";

const router = express.Router();
const authHandler = new AuthHandler();

router.post("/login", authHandler.login);

export default router;