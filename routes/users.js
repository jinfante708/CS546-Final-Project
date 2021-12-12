const express = require("express");
const data = require("../data");
const validator = require("validator");
const xss = require("xss");
const verify = require("../data/verify");

const usersData = data.users;
const router = express.Router();

const ErrorCode = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

//login form
router.get("/", async (request, response) => {
  if (request.session.user) {
    return response.redirect("/");
  }

  const signedUpFlashMessage = request.app.locals.isSignedUp
    ? request.app.locals.signedUpFlashMessage
    : false;

  request.app.locals.isSignedUp = undefined;
  request.app.locals.signedUpFlashMessage = undefined;

  response.render("users/login", {
    pageTitle: "Login",
    signedUpFlashMessage: signedUpFlashMessage,
  });
});

//signup form
router.get("/signup", async (request, response) => {
  if (request.session.user) {
    return response.redirect("/");
  }

  response.render("users/sign-up", { pageTitle: "Sign-up" });
});

//signup submit
router.post("/signup", async (request, response) => {
  if (request.session.user) {
    return response.redirect("/");
  }

  try {
    const requestPostData = request.body;

    validateSignUpTotalFields(Object.keys(requestPostData).length);

    const firstName = validateFirstName(xss(requestPostData.firstName));
    const lastName = validateLastName(xss(requestPostData.lastName));
    const email = validateEmail(xss(requestPostData.email));
    const dateOfBirth = validateDateOfBirth(xss(requestPostData.dateOfBirth));
    const password = validatePassword(xss(requestPostData.password));

    const user = await usersData.create(
      firstName,
      lastName,
      email,
      dateOfBirth,
      password
    );

    if (!user) {
      throwError(ErrorCode.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    request.app.locals.isSignedUp = true;
    request.app.locals.signedUpFlashMessage =
      "Signed up successfully. Login to start using Task Prioritization.";

    response.json({ isError: false });
  } catch (error) {
    response.status(error.code || 500).json({
      isError: true,
      error: error.message || "Error: Internal server error.",
    });
  }
});

//login submit
router.post("/login", async (request, response) => {
  if (request.session.user) {
    return response.redirect("/");
  }

  try {
    const requestPostData = request.body;

    validateLoginTotalArguments(Object.keys(requestPostData).length);

    const email = validateEmail(xss(requestPostData.email));
    const password = validatePassword(xss(requestPostData.password));

    const user = await usersData.checkUser(email, password);

    if (!user) {
      throwError(ErrorCode.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    request.session.user = user;

    request.app.locals.isUserAuthenticated = true;

    response.json({ isError: false });
  } catch (error) {
    response.status(error.code || 500).json({
      isError: true,
      error: error.message || "Error: Internal server error.",
    });
  }
});

//logout
router.get("/logout", async (request, response) => {
  const user = request.session.user;

  if (user) {
    request.session.destroy();
    request.app.locals.isUserAuthenticated = false;
  }

  response.redirect("/users");
});

//change password form
router.get("/changePassword", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/");
  }

  const passwordUpdatedFlashMessage = request.app.locals.isPasswordUpdated
    ? request.app.locals.passwordUpdatedFlashMessage
    : false;

  request.app.locals.isPasswordUpdated = undefined;
  request.app.locals.passwordUpdatedFlashMessage = undefined;

  response.render("users/change-password", {
    pageTitle: "Change Password",
    passwordUpdatedFlashMessage: passwordUpdatedFlashMessage,
  });
});

//profile page
router.get("/profile", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/");
  }

  let user;
  let userStatistics;

  try {
    user = await usersData.get(request.session.user._id);
    userStatistics = await usersData.getUserStatistics(user._id);

    if (Object.keys(userStatistics).length === 0) {
      throwError(
        ErrorCode.BAD_REQUEST,
        "Error: User Statistics were not generated."
      );
    }

    response.render("users/profile", {
      pageTitle: "Profile",
      user: user,
      userStatistics: userStatistics,
    });
  } catch (error) {
    response
      .status(error.code || ErrorCode.INTERNAL_SERVER_ERROR)
      .render("users/profile", {
        pageTitle: "profile",
        user: user,
        userStatistics: {
          numTasklists: 0,
          numTasks: 0,
          completedOnTime: 0,
          notCompletedOnTime: 0,
          completed: 0,
          notCompleted: 0,
        },
        error: error.message || "Internal Server Error",
      });
  }
});

//update profile page
router.get("/update-profile", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/");
  }

  let user;
  try {
    user = await usersData.get(request.session.user._id);

    response.render("users/update-profile", {
      pageTitle: "Update Profile",
      user: user,
    });
  } catch (error) {
    response
      .status(error.code || ErrorCode.INTERNAL_SERVER_ERROR)
      .render("users/update-profile", {
        pageTitle: "Update profile",
        user: user,
        error: error.message || "Internal Server Error",
      });
  }
});

//change password submit
router.put("/password", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/");
  }

  try {
    const requestPostData = request.body;

    validateChangePasswordTotalArguments(Object.keys(requestPostData).length);

    const currentPassword = validatePassword(
      xss(requestPostData.currentPassword)
    );
    const newPassword = validatePassword(xss(requestPostData.newPassword));
    const confirmPassword = validatePassword(
      xss(requestPostData.confirmPassword)
    );

    if (newPassword !== confirmPassword) {
      throwError(
        ErrorCode.BAD_REQUEST,
        "Error: Confirm password does not match new password."
      );
    }

    const password = await usersData.updatePassword(
      request.session.user._id,
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (!password.passwordUpdated) {
      throwError(ErrorCode.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    request.app.locals.isPasswordUpdated = true;
    request.app.locals.passwordUpdatedFlashMessage =
      "Your password has been changed successfully.";

    response.json({ isError: false });
  } catch (error) {
    response.status(error.code || 500).json({
      isError: true,
      error: error.message || "Error: Internal server error.",
    });
  }
});

router.put("/profile", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/");
  }

  try {
    const requestPostData = request.body;

    validateChangeProfileTotalArguments(Object.keys(requestPostData).length);

    const firstName = validateFirstName(xss(requestPostData.firstName));
    const lastName = validateLastName(xss(requestPostData.lastName));
    const dateOfBirth = validateDateOfBirth(xss(requestPostData.dateOfBirth));

    const userDetails = request.session.user;
    if (
      firstName === userDetails.firstName &&
      lastName === userDetails.lastName &&
      dateOfBirth === userDetails.dateOfBirth
    ) {
      throwError(
        ErrorCode.BAD_REQUEST,
        "No fields have been changed from their original values, so no update has occurred!"
      );
    }

    const user = await usersData.updateProfile(
      request.session.user._id,
      firstName,
      lastName,
      dateOfBirth
    );

    if (!user.profileUpdated) {
      throwError(ErrorCode.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    response.json({ isError: false });
  } catch (error) {
    response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
      isError: true,
      error: error.message || "Internal server error",
    });
  }
});

//All validations
const validateSignUpTotalFields = (totalFields) => {
  const TOTAL_MANDATORY_FIELDS = 5;

  if (totalFields !== TOTAL_MANDATORY_FIELDS) {
    throwError(ErrorCode.BAD_REQUEST, "Error: You must supply all fields.");
  }
};

const validateLoginTotalArguments = (totalArguments) => {
  const TOTAL_MANDATORY_ARGUMENTS = 2;

  if (totalArguments !== TOTAL_MANDATORY_ARGUMENTS) {
    throwError(
      ErrorCode.BAD_REQUEST,
      "Error: All fields need to have valid values."
    );
  }
};

const validateChangePasswordTotalArguments = (totalArguments) => {
  const TOTAL_MANDATORY_ARGUMENTS = 3;

  if (totalArguments !== TOTAL_MANDATORY_ARGUMENTS) {
    throwError(
      ErrorCode.BAD_REQUEST,
      "Error: All fields need to have valid values."
    );
  }
};

const validateChangeProfileTotalArguments = (totalArguments) => {
  const TOTAL_MANDATORY_ARGUMENTS = 3;

  if (totalArguments !== TOTAL_MANDATORY_ARGUMENTS) {
    throwError(
      ErrorCode.BAD_REQUEST,
      "Error: All fields need to have valid values."
    );
  }
};

const validateFirstName = (firstName) => {
  return validateUserIdentity(firstName, "First Name");
};

const validateLastName = (lastName) => {
  return validateUserIdentity(lastName, "Last Name");
};

const validateUserIdentity = (_name, variableName) => {
  if (!verify.validString(_name)) {
    throwError(
      ErrorCode.BAD_REQUEST,
      `Error: ${variableName} should be non empty string.`
    );
  }

  const name = _name.trim();

  //should match alphabetical characters and spaces
  const nameRegex = /[^a-zA-Z ]/;

  if (nameRegex.test(name)) {
    throwError(
      ErrorCode.BAD_REQUEST,
      `Error: ${variableName} should have only alphabetical characters and/or spaces.`
    );
  }

  return name;
};

const validateEmail = (_email) => {
  if (!verify.validString(_email)) {
    throwError(
      ErrorCode.BAD_REQUEST,
      `Error: Email should be non empty string.`
    );
  }

  const email = _email.trim().toLowerCase();

  if (!validator.isEmail(email)) {
    throwError(ErrorCode.BAD_REQUEST, `Error: Email not valid.`);
  }

  return email;
};

const validateDateOfBirth = (dateOfBirth) => {
  if (!verify.validDateOfBirth(dateOfBirth)) {
    throwError(
      ErrorCode.BAD_REQUEST,
      "Error: Date of birth should be valid non empty string having format `MM/DD/YYYY`"
    );
  }

  return dateOfBirth.trim();
};

const validatePassword = (password) => {
  if (!verify.validString(password)) {
    throwError(
      ErrorCode.BAD_REQUEST,
      `Error: Password should be non empty string.`
    );
  }

  const MINIMUM_PASSWORD_LENGTH = 8;

  if (password.trim().length < MINIMUM_PASSWORD_LENGTH) {
    throwError(
      ErrorCode.BAD_REQUEST,
      `Error: Password should be of at least ${MINIMUM_PASSWORD_LENGTH} characters long.`
    );
  }

  //should match alphanumeric characters, special characters and no spaces
  const passwordRegex = /[^\S]/;

  if (passwordRegex.test(password)) {
    throwError(
      ErrorCode.BAD_REQUEST,
      "Error: Password should have only alphanumeric or special characters and no spaces."
    );
  }

  return password;
};

const throwError = (code = 500, message = "Internal Server Error") => {
  throw { code, message };
};

module.exports = router;
