/* Collective error checking for all data files and routes*/
const moment = require("moment");

// Validate a string
function validString(input) {
  // Is the argument given?
  if (!input) {
    return false;
  }

  // Is the argument of type string?
  if (typeof input !== "string") {
    return false;
  }

  // Is the argument empty whitespace?
  if (input.trim().length === 0) {
    return false;
  }

  return true;
}

// Validate an email
function validEmail(email) {
  // Is the email given?
  if (!email) {
    return false;
  }

  // Is the email of type string?
  if (typeof email !== "string") {
    return false;
  }

  // Is the email empty whitespace?
  if (email.trim().length === 0) {
    return false;
  }

  // Is the email valid?
  // Regex taken from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Validate a date
function validDate(date) {
  // Is the date given?
  if (!date) {
    return false;
  }

  // Is the date of type string?
  if (typeof date !== "string") {
    return false;
  }

  // Is the date empty whitespace?
  if (date.trim().length === 0) {
    return false;
  }

  // Is the date valid?
  if (!moment(date, "MM/DD/YYYY", true).isValid()) {
    return false;
  }

  return true;
}

// Validate a date of birth
function validDateOfBirth(dob) {
  // Validate general date in MM/DD/YYY format
  if (!validDate(dob)) {
    return false;
  }

  // Is date of birth before today's date?
  // Using the day parameter in isBefore will check for year, month, and day
  // https://momentjs.com/docs/#/query/is-before/
  if (!moment(dob, "MM/DD/YYYY").isBefore(moment(), "day")) {
    return false;
  }

  return true;
}

// Validate a number
function validNumber(num) {
  // Is the number given?
  if (!num) {
    return false;
  }

  // Is the number of type number?
  if (typeof num !== "number") {
    return false;
  }

  return true;
}

/* 
  Validate urgency and importance fields in our "Create a task" form
   
  Note: Urgency will probably be calculated in the backend based on how close to the deadline
  it is for a specific task relative to the current date
*/
function validFormNumber(num) {
  // Is the number valid?
  if (!validNumber(num)) {
    return false;
  }

  // Is the number a valid integer and is it between 1 and 10?
  if (!Number.isInteger(num) || num < 1 || num > 10) {
    return false;
  }

  return true;
}

// Converts a MongoDB document's id to a string
function convertId(doc) {
  doc._id = doc._id.toString();
  return doc;
}

module.exports = {
  validString,
  validEmail,
  validDateOfBirth,
  validNumber,
  validFormNumber,
  convertId,
};
