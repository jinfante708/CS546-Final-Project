const mongoCollections = require("../config/mongoCollections");
const uuid = require("uuid");
const validator = require("validator");
const xss = require("xss");
const verify = require("./verify");
const bcryptjs = require("bcryptjs");
const moment = require("moment");

const users = mongoCollections.users;
const tasklists = mongoCollections.tasklists;
const tasks = mongoCollections.tasks;

const ErrorCode = {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

const SALT_ROUNDS = 16;

async function create(_firstName, _lastName, _email, _dateOfBirth, _password) {
    try {
        validateCreateTotalArguments(arguments.length);

        const firstName = validateFirstName(xss(_firstName));
        const lastName = validateLastName(xss(_lastName));
        const email = validateEmail(xss(_email));
        const dateOfBirth = validateDateOfBirth(xss(_dateOfBirth));
        const password = validatePassword(xss(_password));

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
            dateOfCreation: moment().format("MM/DD/YYYY"),
            taskLists: [],
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

        const userId = validateUserId(xss(_userId));

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

async function getAll() {
    try {
        const usersCollection = await users();

        const usersList = await usersCollection.find({}).toArray();

        return usersList;
    } catch (error) {
        throwCatchError(error);
    }
}

async function getUserStatistics(_userId) {
  /*
    - Total number of tasklists
    - Total number of tasks across all tasklists
    - Number of tasks completed on time
    - Number of tasks not completed on time
    - Number of tasks completed overall
    - Number of tasks not completed overall
  */
  validateGetTotalArguments(arguments.length);

  const userId = validateUserId(_userId);

  const tasklistsCollection = await tasklists();

  const tasklists = tasklistsCollection.find({ userId: userId }).toArray();
  const numTasklists = tasklists.length;

  const tasksCollection = await tasks();
  const tasks = tasksCollection.find({ userId: userId }).toArray();
  const numTasks = tasks.length;

  let completedOnTime;
  let notCompletedOnTime;
  let completed;
  let notCompleted;

  for (let task of tasks) {
    let deadlineDate = task.deadlineDate;
    let completionDate = task.completionDate;
    // Converting both to MM/DD/YYYY format just in case
    let deadline = moment(Date.parse(deadlineDate)).format("MM/DD/YYYY");
    let completion = moment(Date.parse(completionDate)).format("MM/DD/YYYY");
    let isCompleted = task.isCompleted;

    if (isCompleted) {
      completed += 1;

      let doneOnTime = moment(Date.parse(completion)).isBefore(
        Date.parse(deadline)
      );
      if (doneOnTime) {
        completedOnTime += 1;
      } else {
        notCompletedOnTime += 1;
      }
    } else {
      notCompleted += 1;
    }

    let userStatistics = {
      numTasklists = numTasklists,
      numTasks = numTasks,
      completedOnTime = completedOnTime,
      notCompletedOnTime, notCompletedOnTime,
      completed = completed,
      notCompleted = notCompleted
    }

    return userStatistics;
  }
  try {
  } catch (error) {
    throwCatchError(error);
  }
}

async function checkUser(_email, _password) {
    try {
        validateCheckUserTotalArguments(arguments.length);

        const email = validateEmail(xss(_email));
        const password = validatePassword(xss(_password));

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

async function updatePassword(
    _userId,
    _currentPassword,
    _newPassword,
    _confirmPassword
) {
    try {
        validateUpdatePasswordTotalArguments(arguments.length);

        const userId = validateUserId(xss(_userId));
        const currentPassword = validatePassword(xss(_currentPassword));
        const newPassword = validatePassword(xss(_newPassword));
        const confirmPassword = validatePassword(xss(_confirmPassword));

        if (newPassword !== confirmPassword) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Confirm password does not match new password."
            );
        }

        const usersCollection = await users();

        const user = await usersCollection.findOne(
            { _id: userId },
            {
                projection: {
                    _id: 1,
                    password: 1,
                },
            }
        );

        if (!user) {
            throwError(ErrorCode.NOT_FOUND, "Error: User not found.");
        }

        const isPasswordCorrect = await bcryptjs.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Incorrect current password."
            );
        }

        const newPasswordHash = await bcryptjs.hash(newPassword, SALT_ROUNDS);

        const toBeUpdated = {
            password: newPasswordHash,
        };

        const updatedInfo = await usersCollection.updateOne(
            { _id: userId },
            { $set: toBeUpdated }
        );

        if (updatedInfo.modifiedCount !== 1) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Error: Could not update password."
            );
        }

        return { passwordUpdated: true };
    } catch (error) {
        throwCatchError(error);
    }
}

async function updateProfile(_userId, _firstName, _lastName, _dateOfBirth) {
    try {
        validateUpdateProfileTotalArguments(arguments.length);

        const userId = validateUserId(xss(_userId));
        const firstName = validateFirstName(xss(_firstName));
        const lastName = validateLastName(xss(_lastName));
        const dateOfBirth = validateDateOfBirth(xss(_dateOfBirth));

        const usersCollection = await users();

        const user = await usersCollection.findOne(
            { _id: userId },
            {
                projection: {
                    _id: 1,
                },
            }
        );

        if (!user) {
            throwError(ErrorCode.NOT_FOUND, "Error: User not found.");
        }

        const toBeUpdated = {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
        };

        const updatedInfo = await usersCollection.updateOne(
            { _id: userId },
            { $set: toBeUpdated }
        );

        if (updatedInfo.modifiedCount !== 1) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Error: Could not update profile."
            );
        }

        return { profileUpdated: true };
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

const validateUpdatePasswordTotalArguments = (totalArguments) => {
    const TOTAL_MANDATORY_ARGUMENTS = 4;

    if (totalArguments !== TOTAL_MANDATORY_ARGUMENTS) {
        throwError(
            ErrorCode.BAD_REQUEST,
            "Error: All fields need to have valid values."
        );
    }
};

const validateUpdateProfileTotalArguments = (totalArguments) => {
    const TOTAL_MANDATORY_ARGUMENTS = 4;

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
    getAll,
    getUserStatistics,
    checkUser,
    updatePassword,
    updateProfile,
};
