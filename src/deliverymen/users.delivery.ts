import UserHandler from "@handlers/user.handler";
import express from "express";
import { AuthService } from "@services/auth.service";

const router = express.Router();
const userHandler = new UserHandler();
const authService = new AuthService();

router.route("/bulk").post(userHandler.insertUsers);
router.route("/all").get(authService.auth, userHandler.getAllUsers);

router
  .route("/:id")
  .get(authService.auth, userHandler.getUserById)
  .put(authService.auth, userHandler.updateUser);

export default router;
