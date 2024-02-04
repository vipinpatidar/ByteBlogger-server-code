import { check, body } from "express-validator";
import User from "../../models/User.js";
import bcrypt from "bcrypt";

export const checkSignUp = [
  // Check full name
  check("fullName")
    .notEmpty()
    .withMessage("Please enter fullName.")
    .isLength({ min: 3 })
    .withMessage("Please enter at least 3 character.")
    .trim(),
  // check Username
  check("username")
    .notEmpty()
    .withMessage("Please enter username.")
    .custom(async (value, { req }) => {
      const userDoc = await User.findOne({ "personal_info.username": value });

      if (userDoc) {
        return Promise.reject(
          "This Username already taken. Please pick a different one."
        );
      }

      return userDoc;
    }),
  // Check email
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value, { req }) => {
      const userDoc = await User.findOne({ "personal_info.email": value });

      if (userDoc) {
        return Promise.reject(
          "Email already exists. Please pick a different one."
        );
      }

      return userDoc;
    })
    .normalizeEmail(),

  //password check
  check("password")
    .custom(async (value, { req }) => {
      const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

      // if not matches
      if (!regex.test(value)) {
        throw new Error(
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter."
        );
      }

      return true;
    })
    .trim(),
];
///^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/

export const checkLogin = [
  // check email
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value, { req }) => {
      const userDoc = await User.findOne({ "personal_info.email": value });

      if (!userDoc) {
        return Promise.reject(
          "This email not exists. Please enter a valid email or Sign up."
        );
      }

      if (userDoc.google_auth) {
        return Promise.reject(
          "Account was created by Google auth. Please use Google Option form login"
        );
      }

      return userDoc;
    })
    .normalizeEmail(),

  // check password
  //password check
  check("password")
    .custom((value, { req }) => {
      const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
      // console.log(req.body);
      // if not matches
      if (!regex.test(value)) {
        throw new Error(
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter."
        );
      }

      return true;
    })
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        "personal_info.email": req.body.email,
      });
      //  console.log(user);

      const doMatch = await bcrypt.compare(value, user.personal_info.password);

      if (!doMatch) {
        return Promise.reject("Password did not match. enter valid password.");
      }
      return doMatch;
    })
    .trim(),
];

export const checkChangePassword = [
  //current password check
  check("currentPassword")
    .custom((value, { req }) => {
      const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
      // console.log(req.body);
      // if not matches
      if (!regex.test(value)) {
        throw new Error(
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter."
        );
      }

      return true;
    })
    .custom(async (value, { req }) => {
      const user = await User.findById({
        _id: req.userId,
      });
      //  console.log(user);

      const doMatch = await bcrypt.compare(value, user.personal_info.password);

      if (!doMatch) {
        return Promise.reject(
          "current Password did not match. enter valid password."
        );
      }
      return doMatch;
    })
    .trim(),

  //new password check
  check("newPassword")
    .custom(async (value, { req }) => {
      const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

      // if not matches
      if (!regex.test(value)) {
        throw new Error(
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter."
        );
      }

      return true;
    })
    .trim(),
];
