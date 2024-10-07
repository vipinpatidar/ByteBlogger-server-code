import express from "express";
import {
  deleteBlog,
  getAllDashboardBlogs,
  getBlogs,
  getSingleBlog,
  getTrendingBlogs,
  postCreateBlog,
  putLikeAndDislike,
} from "../controllers/blog.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { checkBlog } from "../utils/validators/blog.validator.js";
import {
  createBlogRateLimiter,
  deleteBlogRateLimiter,
} from "../middlewares/rate-limit.js";

export const blogRoutes = express.Router();

blogRoutes.get("/get-blogs", getBlogs);
blogRoutes.get("/get-blog/:blogId", getSingleBlog);

blogRoutes.get("/get-dashboard-blogs", verifyJWT, getAllDashboardBlogs);

blogRoutes.get("/get-trending-blogs", getTrendingBlogs);

blogRoutes.post(
  "/create-blog",
  [verifyJWT, createBlogRateLimiter, checkBlog],
  postCreateBlog
);

//LIKE AND DISLIKE
blogRoutes.put("/like-blog", verifyJWT, putLikeAndDislike);

blogRoutes.delete(
  "/delete-blog",
  [verifyJWT, deleteBlogRateLimiter],
  deleteBlog
);
