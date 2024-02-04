import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { validationResult } from "express-validator";

/*======================= GET USER ======================== */

export const getUser = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -google_auth -updatedAt");
    // .populate("blogs");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= GET SEARCHED USER ======================== */

export const getSearchedUsers = async (req, res, next) => {
  try {
    const { userQuery } = req.query;

    const user = await User.find({
      $or: [
        { "personal_info.username": new RegExp(userQuery, "i") },
        { "personal_info.fullName": new RegExp(userQuery, "i") },
      ],
    })
      .limit(40)
      .select(
        "personal_info.username personal_info.fullName personal_info.profile_img isEditor isAdmin"
      );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= POST UPLOAD PROFILE IMAGE ======================== */

export const postUploadUserProfileImage = async (req, res, next) => {
  try {
    const { profileImg } = req.body;
    const userId = req.userId;

    await User.findOneAndUpdate(
      {
        _id: userId,
      },
      { "personal_info.profile_img": profileImg }
    );

    res.status(200).json({ profileImg: profileImg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= PUT UPDATE PROFILE INFO ======================== */

export const putUpdateProfileInfo = async (req, res, next) => {
  try {
    const { username, bio, social_links } = req.body;
    const userId = req.userId;

    // Input validation
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(422).json({ error: error.array()[0].msg });
    }

    await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links: social_links,
      },
      {
        runValidators: true,
      }
    );

    res.status(200).json({ username: username });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(500).json({
        error: "Username already taken please use other unique username.",
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// Mongodb gives 11000 error code if it finds duplicate data

/*======================= PUT UPDATE TO EDITOR ======================== */

export const putUpdateAsEditor = async (req, res, next) => {
  try {
    const { userId, isEditor } = req.body;
    const isAdmin = req.isAdmin;

    // console.log(userId);
    const admin = await User.findOne({ isAdmin: true });

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { isEditor: isEditor },
      { new: true }
    );

    if (!user) {
      return res.status(500).json({
        error: "user not found.",
      });
    }

    if (!isAdmin) {
      let toAdmin = new Notification({
        type: "editor",
        blog: userId,
        notification_for: admin._id,
        user: userId,
        message: `A user ${user.personal_info.fullName} is become a new editor`,
      });

      await toAdmin.save();
    }

    const { password: pass, bio, ...UserOtherInfo } = user.personal_info;

    const frontData = {
      ...UserOtherInfo,
      userId: user._id,
      isAdmin: user.isAdmin,
      isEditor: user.isEditor,
    };

    res.status(200).json(frontData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= GET EDITOR OR USERS ======================== */

export const getEditorOrUsers = async (req, res, next) => {
  try {
    const { query, page, isEditor } = req.query;
    const isAdmin = req.isAdmin;

    const pageIndex = page ? parseInt(page, 10) : 0;
    let maxLimit = 4;

    if (!isAdmin) {
      return res.status(401).json({ error: "unauthorized action" });
    }

    let findQuery = {
      isEditor: isEditor === "true",
      $or: [
        { "personal_info.fullName": new RegExp(query, "i") },
        { "personal_info.email": new RegExp(query, "i") },
      ],
      isAdmin: { $ne: true },
    };

    const users = await User.find(findQuery)
      .select("-personal_info.password -google_auth")
      .skip(page)
      .limit(maxLimit)
      .sort({ updatedAt: -1 });

    let totalUserCount = await User.find(findQuery).count();

    const nextPage =
      totalUserCount > pageIndex + users.length
        ? pageIndex + users.length
        : null;

    res.status(200).json({ users, nextPage: nextPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
