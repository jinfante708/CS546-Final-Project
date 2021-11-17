const mongoCollections = require("../config/mongoCollections");
const uuid = require("uuid");
const validator = require("validator");
const verify = require("./verify");
const bcryptjs = require("bcryptjs");

const users = mongoCollections.users;

const ErrorCode = {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

const SALT_ROUNDS = 16;

async function create(_firstName, _lastName, _email, _dateOfBirth, _password) {
    try {
        validateCreateTotalArguments(arguments.length);

        const firstName = validateFirstName(_firstName);
        const lastName = validateLastName(_lastName);
        const email = validateEmail(_email);
        const dateOfBirth = validateDateOfBirth(_dateOfBirth);
        const password = validatePassword(_password);

        const usersCollection = await users();

        const user = await usersCollection.findOne({ email: email });

        if (user) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Already registered with given email id."
            );
        }

        const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS);

        const newUserId = uuid.v4();

        const newUser = {
            _id: newUserId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            dateOfBirth: dateOfBirth,
            password: passwordHash,
        };

        const insertedInfo = await usersCollection.insertOne(newUser);

        if (!insertedInfo.insertedId) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Error: Couldn't add user."
            );
        }

        return await get(newUserId);
    } catch (error) {
        throwCatchError(error);
    }
}

async function get(_userId) {
    try {
        validateGetTotalArguments(arguments.length);

        const userId = validateUserId(_userId);

        const usersCollection = await users();

        const user = await usersCollection.findOne(
            { _id: userId },
            {
                projection: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    dateOfBirth: 1,
                },
            }
        );

        if (!user) {
            throwError(ErrorCode.NOT_FOUND, "Error: User not found.");
        }

        return user;
    } catch (error) {
        throwCatchError(error);
    }
}

async function checkUser(_email, _password) {
    try {
        validateCheckUserTotalArguments(arguments.length);

        const email = validateEmail(_email);
        const password = validatePassword(_password);

        const usersCollection = await users();

        const user = await usersCollection.findOne(
            { email: email },
            {
                projection: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    dateOfBirth: 1,
                    password: 1,
                },
            }
        );

        if (!user) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Incorrect email or password."
            );
        }

        const isPasswordCorrect = await bcryptjs.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Incorrect email or password."
            );
        }

        delete user.password;

        return user;
    } catch (error) {
        throwCatchError(error);
    }
}

//All validations
const validateCreateTotalArguments = (totalArguments) => {
    const TOTAL_MANDATORY_ARGUMENTS = 5;

    if (totalArguments !== TOTAL_MANDATORY_ARGUMENTS) {
        throwError(
            ErrorCode.BAD_REQUEST,
            "Error: All fields need to have valid values."
        );
    }
};

const validateGetTotalArguments = (totalArguments) => {
    const TOTAL_MANDATORY_ARGUMENTS = 1;

    if (totalArguments !== TOTAL_MANDATORY_ARGUMENTS) {
        throwError(
            ErrorCode.BAD_REQUEST,
            "Error: All fields need to have valid values."
        );
    }
};

const validateCheckUserTotalArguments = (totalArguments) => {
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

const validateUserId = (_userId) => {
    if (!verify.validString(_userId)) {
        throwError(
            ErrorCode.BAD_REQUEST,
            `Error: User id should be non empty string.`
        );
    }

    const userId = _userId.trim();

    const PROJECT_UUID_VERSION = 4;

    if (
        !uuid.validate(userId) ||
        uuid.version(userId) !== PROJECT_UUID_VERSION
    ) {
        throwError(
            ErrorCode.BAD_REQUEST,
            `Error: User id should be non empty string.`
        );
    }

    return userId;
};

const throwError = (code = 500, message = "Internal Server Error") => {
    throw { code, message };
};

const throwCatchError = (error) => {
    if (error.code && error.message) {
        throwError(error.code, error.message);
    }

    throwError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Error: Internal server error."
    );
};

module.exports = {
    create,
    get,
    checkUser,
};
