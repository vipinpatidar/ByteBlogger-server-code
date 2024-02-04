import express from "express";
import {
  deleteBlogComment,
  getBlogComments,
  postAddComment,
} from "../controllers/comment.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

export const commentRoutes = express.Router();

commentRoutes.get("/get-comments", getBlogComments);

commentRoutes.post("/add-comment", verifyJWT, postAddComment);

commentRoutes.delete("/delete-comment", verifyJWT, deleteBlogComment);
