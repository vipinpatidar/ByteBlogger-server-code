import express from "express";
import { postGoogleAuth } from "../controllers/googleAuth.js";

export const googleAuthRoutes = express.Router();

googleAuthRoutes.post("/", postGoogleAuth);

// googleAuthRoutes.post("/login");

// googleAuthRoutes.post("/logout");
