import express from "express";
import {
  postChangePassword,
  postLoginUser,
  postLogoutUser,
  postSignupUser,
} from "../controllers/auth.js";

import {
  checkSignUp,
  checkLogin,
  checkChangePassword,
} from "../utils/validators/auth.validator.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", checkSignUp, postSignupUser);

authRoutes.post("/login", checkLogin, postLoginUser);

authRoutes.post(
  "/change-password",
  [verifyJWT, checkChangePassword],
  postChangePassword
);

authRoutes.post("/logout", postLogoutUser);
