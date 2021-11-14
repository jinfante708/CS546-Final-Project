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

module.exports = {
  validString,
  validEmail,
  validDateOfBirth,
};
