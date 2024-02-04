import { check, body } from "express-validator";

export const checkBlog = [
  check("title")
    .notEmpty()
    .withMessage("You must provide a blog title.")
    .trim(),

  check("des")
    .notEmpty()
    .withMessage("Please write a short description about your blog.")
    .isLength({ max: 200 })
    .withMessage("Please write description under 200 characters."),

  check("banner")
    .notEmpty()
    .withMessage("You must provide Banner Image for blog."),

  check("tags")
    .isArray({ min: 1, max: 10 })
    .withMessage("Tags should be min 1 and maximum 10."),

  check("content")
    .custom((value, { req }) => {
      if (value.blocks.length > 0) {
        return true;
      }
      return false;
    })
    .withMessage("There must be some story content to publish it."),
];
