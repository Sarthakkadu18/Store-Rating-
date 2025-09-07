const { body } = require("express-validator")

// Common validation rules
const nameValidation = body("name")
  .isLength({ min: 20, max: 60 })
  .withMessage("Name must be between 20 and 60 characters")

const emailValidation = body("email").isEmail().withMessage("Please provide a valid email")

const passwordValidation = body("password")
  .isLength({ min: 8, max: 16 })
  .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
  .withMessage("Password must be 8-16 characters with at least one uppercase letter and one special character")

const addressValidation = body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters")

const ratingValidation = body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5")

module.exports = {
  nameValidation,
  emailValidation,
  passwordValidation,
  addressValidation,
  ratingValidation,
}
