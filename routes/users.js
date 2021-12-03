const express = require("express");
const data = require("../data");
const validator = require("validator");
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
    redirectIfLoggedIn(request, response, "/");

    response.render("users/login", { pageTitle: "Login" });
});

//signup form
router.get("/signup", async (request, response) => {
    redirectIfLoggedIn(request, response, "/");

    response.render("users/sign-up", { pageTitle: "Sign-up" });
});

//signup submit
router.post("/signup", async (request, response) => {
    redirectIfLoggedIn(request, response, "/");

    let displayFirstName,
        displayLastName,
        displayEmail,
        displayDateOfBirth,
        displayPassword;

    try {
        const requestPostData = request.body;

        displayFirstName = requestPostData.firstName;
        displayLastName = requestPostData.lastName;
        displayEmail = requestPostData.email;
        displayDateOfBirth = requestPostData.dateOfBirth;
        displayPassword = requestPostData.password;

        validateSignUpTotalFields(Object.keys(requestPostData).length);

        const firstName = validateFirstName(requestPostData.firstName);
        const lastName = validateLastName(requestPostData.lastName);
        const email = validateEmail(requestPostData.email);
        const dateOfBirth = validateDateOfBirth(requestPostData.dateOfBirth);
        const password = validatePassword(requestPostData.password);

        const user = await usersData.create(
            firstName,
            lastName,
            email,
            dateOfBirth,
            password
        );

        if (!user) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        //change this after UI
        response.redirect("/");
    } catch (error) {
        response
            .status(error.code || ErrorCode.INTERNAL_SERVER_ERROR)
            .render("users/sign-up", {
                pageTitle: "Sign-up",
                firstName: displayFirstName,
                lastName: displayLastName,
                email: displayEmail,
                dateOfBirth: displayDateOfBirth,
                password: displayPassword,
                error: error.message || "Internal server error",
            });
    }
});

//login submit
router.post("/login", async (request, response) => {
    redirectIfLoggedIn(request, response, "/");

    let displayEmail, displayPassword;

    try {
        const requestPostData = request.body;

        displayEmail = requestPostData.email;
        displayPassword = requestPostData.password;

        validateLoginTotalArguments(Object.keys(requestPostData).length);

        const email = validateEmail(requestPostData.email);
        const password = validatePassword(requestPostData.password);

        const user = await usersData.checkUser(email, password);

        if (!user) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        request.session.user = { user };

        //change this after UI
        response.redirect("/private");
    } catch (error) {
        response
            .status(error.code || ErrorCode.INTERNAL_SERVER_ERROR)
            .render("users/login", {
                pageTitle: "Login",
                email: displayEmail,
                password: displayPassword,
                error: error.message || "Internal Server Error",
            });
    }
});

//logout
router.get("/logout", async (request, response) => {
     const user = request.session.user;

     if (user) {
         request.session.destroy();
     }

    response.redirect("/");
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

const redirectIfLoggedIn = (request, response, redirectTo = "/") => {
    const user = request.session.user;

    if (user) {
        response.redirect(redirectTo);
    }
};

module.exports = router;
