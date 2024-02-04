import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { postStipeCharges } from "../controllers/stripe.js";

export const stripeRoutes = express.Router();

stripeRoutes.post("/", verifyJWT, postStipeCharges);
