import express from "express";
import {
  getEditorOrUsers,
  getSearchedUsers,
  getUser,
  postUploadUserProfileImage,
  putUpdateAsEditor,
  putUpdateProfileInfo,
} from "../controllers/user.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { checkUserInfoData } from "../utils/validators/user.validator.js";

export const usersRoutes = express.Router();

usersRoutes.get("/search-users", getSearchedUsers);
usersRoutes.get("/get-user/:username", getUser);
usersRoutes.get("/get-editors", verifyJWT, getEditorOrUsers);

usersRoutes.post(
  "/upload-profile-image",
  verifyJWT,
  postUploadUserProfileImage
);

usersRoutes.put(
  "/update-profile-info",
  [verifyJWT, checkUserInfoData],
  putUpdateProfileInfo
);

usersRoutes.put("/update-as-editor", verifyJWT, putUpdateAsEditor);
