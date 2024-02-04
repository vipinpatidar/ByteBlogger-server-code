import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import multer from "multer";
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

//Fire Base logics
import firebaseAdmin from "firebase-admin";
import serviceAccountKey from "./blogging-app-d2d7a-firebase-adminsdk-9reft-a54e3d3394.json" assert { type: "json" };

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccountKey),
});

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
export const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(
  cors({
    origin: [
      "https://byteblogger-vipin.netlify.app",
      "http://localhost:5173",
      "https://byteblogger-website-client.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(cookieParser());

/*============ Multer configuration ================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const suffix = Date.now();
    cb(null, suffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

//MULTER
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 6, // 6Mb
  },
});

app.post("/api/upload", upload.single("image"), (req, res, next) => {
  try {
    const file = req.file;
    // console.log(file);
    res.status(200).json(file.filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*============ Multer END ================= */

//ROUTES SETUP
app.use("/api/auth", authRoutes);
app.use("/api/googleAuth", googleAuthRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/payment", stripeRoutes);

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
