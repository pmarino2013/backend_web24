import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
} from "../middlewares/validators.js";

import {
  getAuth,
  login,
  register,
  verifyEmail,
  logOut,
  getProfile,
  updatePassword,
  resendCodeVerificationMail,
} from "../controllers/auth.controller.js";

const router = Router();

//Rutas públicas
router.post("/register", registerValidation(), register);
router.post("/login", loginValidation(), login);
router.post("/verify-email", verifyEmailValidation(), verifyEmail);

//Rutas protegidas
router.get("/", authenticate, getAuth);
router.post("/logout", authenticate, logOut);
router.get("/profile", authenticate, getProfile);

//Rutas para actualizar contraseña y reenviar código
router.put("/password", loginValidation(), updatePassword);
router.post("/resend", loginValidation(), resendCodeVerificationMail);

export default router;
