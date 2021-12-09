$(document).ready(function () {
  let hasErrors = false;

  function validString(str) {
    // Is input given? Is input not a number? (All form input is of type string)
    if (!str || !isNaN(str)) {
      hasErrors = true;
      return false;
    }

    return true;
  }

  // Is date given? Is date of format MM/DD/YYYY?
  function validDate(date) {
    if (!date || !moment(date, "MM/DD/YYYY", true).isValid()) {
      hasErrors = true;
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

  let form = $("#edit-user-profile");
  let firstName = $("#first-name-input");
  let lastName = $("#last-name-input");
  let dateOfBirth = $("#date-of-birth-input");
  let submitBtn = $("#submitButton");
  let errors = $("#error-list");

  form.submit((event) => {
    event.preventDefault();
    hasErrors = false;
    submitBtn.prop("disabled", true);
    errors.hide();

    firstName.removeClass("is-invalid is-valid");
    lastName.removeClass("is-invalid is-valid");
    dateOfBirth.removeClass("is-invalid is-valid");

    let userInfo = {
      firstName: firstName.val().trim(),
      lastName: lastName.val().trim(),
      dateOfBirth: dateOfBirth.val().trim(),
    };

    // Client-side error checking for three fields
    // Is the first name a valid string?
    if (!validString(userInfo.firstName)) {
      firstName.addClass("is-invalid");
    } else {
      firstName.addClass("is-valid");
    }

    // Is last name a valid string?
    if (!validString(userInfo.lastName)) {
      lastName.addClass("is-invalid");
    } else {
      lastName.addClass("is-valid");
    }

    // Is date of birth a valid date?
    if (!validDateOfBirth(userInfo.dateOfBirth)) {
      dateOfBirth.addClass("is-invalid");
    } else {
      dateOfBirth.addClass("is-valid");
    }

    if (!hasErrors) {
      var requestConfig = {
        method: "PUT",
        url: `/users/profile`,
        contentType: "application/json",
        data: JSON.stringify(userInfo),
        success: function () {
          window.location.href = "/users/profile";
        },
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        console.log(responseMessage);
      });
    } else {
      submitBtn.prop("disabled", false);
    }
  });
});
