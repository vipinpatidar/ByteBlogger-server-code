import User from "../models/User.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/*======================= SIGNUP USER ======================== */

export const postSignupUser = async (req, res, next) => {
  try {
    const { fullName, email, password, username } = req.body;

    const error = validationResult(req);

    if (!error.isEmpty()) {
      // console.log(error.array());
      return res.status(422).json({ error: error.array()[0].msg });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      personal_info: {
        fullName,
        email,
        password: hashedPassword,
        username,
      },
    };

    const user = await User.create(newUser);

    const { password: pass, bio, ...UserOtherInfo } = user.personal_info;

    // console.log(UserOtherInfo);

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, isEditor: user.isEditor },
      process.env.SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );

    const frontData = {
      ...UserOtherInfo,
      userId: user._id,
      isAdmin: user?.isAdmin,
      isEditor: user?.isEditor,
      token,
    };

    res.cookie("accessToken", token, { httpOnly: true });

    res.status(200).json(frontData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= LOGIN USER ======================== */

export const postLoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const error = validationResult(req);

    if (!error.isEmpty()) {
      // console.log(error.array());
      return res.status(422).json({ error: error.array()[0].msg });
    }

    const user = await User.findOne({
      "personal_info.email": email,
    });

    const { password: pass, bio, ...UserOtherInfo } = user.personal_info;

    // console.log(UserOtherInfo);

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, isEditor: user.isEditor },
      process.env.SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );

    const frontData = {
      ...UserOtherInfo,
      userId: user._id,
      isAdmin: user.isAdmin,
      isEditor: user.isEditor,
      token,
    };

    res.cookie("accessToken", token, { httpOnly: true });

    res.status(200).json(frontData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= LOGOUT USER ======================== */

export const postLogoutUser = (req, res) => {
  try {
    res
      .clearCookie("accessToken", { httpOnly: true })
      .status(200)
      .json("Logged out successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= CHANGE PASSWORD ======================== */

export const postChangePassword = async (req, res) => {
  try {
    let { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const error = validationResult(req);

    if (!error.isEmpty()) {
      // console.log(error.array());
      return res.status(422).json({ error: error.array()[0].msg });
    }

    const user = await User.findOne({ _id: userId });

    if (user.google_auth) {
      return res.status(422).json({
        error:
          "This Account is using Google Auth. You cannot change password from here.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        "personal_info.password": hashedPassword,
      }
    );

    res.status(200).json("Password updated successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
