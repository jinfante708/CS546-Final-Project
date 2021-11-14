/* Collective error checking for all data files and routes*/

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

function validDateOfBirth(dob) {}

module.exports = {
  validString,
  validEmail,
  validDateOfBirth,
};
