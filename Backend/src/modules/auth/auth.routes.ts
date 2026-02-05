import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";

const router = Router();

router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);

router.post(
  "/register",
  verifyToken,
  authorizeRoles("ADMIN"),
  AuthController.register
);

router.post("/logout", verifyToken, AuthController.logout);

export default router;
