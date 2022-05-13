const { body } = require("express-validator");
const User = require("../models/user");

exports.registerValidator = [
  body("email")
    .isEmail()
    .withMessage("Enter your email correctly")
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("This email is olready exist");
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),

  body("password", "Password should be min 6 symbols")
    .isLength({
      min: 6,
      max: 20,
    })
    .isAlphanumeric()
    .trim(),

  body("confirm")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password should be similar");
      }
      return true;
    })
    .trim(),

  body("name")
    .isLength({ min: 3, max: 20 })
    .withMessage("Name should be min 3 symbols")
    .trim(),
];

exports.notebookValidator = [
  body("title").isLength({ min: 4 })
    .withMessage("Minimum length for Notebook model should be 4 symbols"),
  body("price").isNumeric().withMessage("Write correct price"),
  body("img").isURL().withMessage("Write correct Url Image"),
  body("descr").isLength({min: 10}).withMessage("Description should be minimum 10 symbols"),
];
