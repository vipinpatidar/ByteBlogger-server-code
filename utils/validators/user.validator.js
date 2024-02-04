import { check } from "express-validator";
import User from "../../models/User.js";
import bcrypt from "bcrypt";

export const checkUserInfoData = [
  // check Username
  check("username")
    .notEmpty()
    .withMessage("Please enter username.")
    .isLength({ min: 3 })
    .withMessage("Please write username with at least 3 characters."),

  // Check Bio
  check("bio")
    .isLength({ max: 200 })
    .withMessage("Please write bio under 200 characters."),

  // Check social links

  check("social_links").custom((value, { req }) => {
    Object.entries(value).forEach(([key, val]) => {
      if (val.length) {
        // Check if it's a valid URL
        try {
          new URL(val);
        } catch (error) {
          throw new Error(
            `${key} link is not a valid URL. Please check again or make sure it starts with 'https://'`
          );
        }

        // Check hostname
        let hostname = new URL(val).hostname;

        if (!hostname?.includes(`${key}.com`) && key !== `website`) {
          throw new Error(
            `${key} link is not a valid link please check again or maybe add .com to link `
          );
        }
      }
    });
    return true;
  }),
];
