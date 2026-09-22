const validator = require("validator");

const validate = (data) => {
  const mandatoryField = ['firstName', 'emailId', 'password'];
  const IsAllowed = mandatoryField.every((k) => Object.keys(data).includes(k));
  if (!IsAllowed) {
    throw new Error("Please fill in all required fields (first name, email, password)");
  }
  if (!validator.isEmail(data.emailId)) {
    throw new Error("Please enter a valid email address");
  }
  if (!validator.isStrongPassword(data.password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
    throw new Error("Password must be at least 8 characters with 1 uppercase letter and 1 number");
  }
};

module.exports = validate;
