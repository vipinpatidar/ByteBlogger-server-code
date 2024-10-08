import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

// ROUTES IMPORT
import { authRoutes } from "./routes/auth.js";
import { googleAuthRoutes } from "./routes/googleAuth.js";
import { blogRoutes } from "./routes/blog.js";
import { usersRoutes } from "./routes/user.js";
import { commentRoutes } from "./routes/comment.js";
import { notificationRoutes } from "./routes/notification.js";
import { stripeRoutes } from "./routes/stripe.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { favoritesRoutes } from "./routes/favorites.js";

//Fire Base logics
import firebaseAdmin from "firebase-admin";
import serviceAccountKey from "./blogging-app-d2d7a-firebase-adminsdk-9reft-a54e3d3394.json" assert { type: "json" };

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccountKey),
});

const app = express();
const port = process.env.PORT || 8080;
export const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(
  cors({
    origin: ["https://byteblogger-vipin.netlify.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use("/uploads", express.static("uploads"));

app.use(cookieParser());

//ROUTES SETUP
app.use("/api/auth", authRoutes);
app.use("/api/googleAuth", googleAuthRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/payment", stripeRoutes);
app.use("/api/favorites", favoritesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URL, {
    autoIndex: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
