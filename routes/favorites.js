import express from "express";
import {
  getLikedBlogs,
  getReadLaterBlogs,
  putReadLaterBlogs,
} from "../controllers/favorites.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

export const favoritesRoutes = express.Router();

favoritesRoutes.get("/read-later", verifyJWT, getReadLaterBlogs);

favoritesRoutes.put("/read-later", verifyJWT, putReadLaterBlogs);

favoritesRoutes.get("/liked-blogs", verifyJWT, getLikedBlogs);
