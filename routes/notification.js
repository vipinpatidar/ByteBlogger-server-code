import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  deleteNotification,
  getIsNotification,
  getNotifications,
  postAddNotification,
} from "../controllers/notification.js";

export const notificationRoutes = express.Router();

notificationRoutes.get("/isNotification", verifyJWT, getIsNotification);

notificationRoutes.get("/get-notifications", verifyJWT, getNotifications);

notificationRoutes.post(
  "/add-message-notification",
  verifyJWT,
  postAddNotification
);

notificationRoutes.delete(
  "/delete-notification",
  verifyJWT,
  deleteNotification
);
