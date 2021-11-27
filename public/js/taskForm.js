$(document).ready(function () {
  let hasErrors = false;

  function validString(str) {
    // Is input given? Is input not a number? (All form input is of type string)
    if (!str || isNaN(str)) {
      hasErrors = true;
      return false;
    }

    return true;
  }

  function validNumber(num) {
    if (!num || !isNaN(num)) {
      hasErrors = true;
      return false;
    }

    return true;
  }

  // Is date given? Is date of format MM/DD/YYYY?
  function validDate(date) {
    if (!date || !moment(dateOfReview, "MM/DD/YYYY", true).isValid()) {
      hasErrors = true;
      return false;
    }

    return true;
  }

  let form = $("#add-task-form");
  let name = $("#task-name-input");
  let importance = $("#importance-input");
  let deadlineDate = $("#deadline-input");
  let submitBtn = $("#submitButton");
  let errors = $("#error-list");

  form.submit((event) => {
    event.preventDefault();
    hasErrors = false;
    submitBtn.prop("disabled", true);
    errors.hide();

    name.removeClass("is-invalid is-valid");
    importance.removeClass("is-invalid is-valid");
    deadlineDate.removeClass("is-invalid is-valid");

    let taskInfo = {
      name: name.val().trim(),
      importance: importance.val().trim(),
      deadlineDate: deadlineDate.val().trim(),
    };

    // Client-side error checking for three fields

    // Is the task name a valid string?
    if (!validString(taskInfo.name)) {
      name.addClass("is-invalid");
    } else {
      name.addClass("is-valid");
    }

    // Is importance a valid number?
    if (!validNumber(taskInfo.importance)) {
      importance.addClass("is-invalid");
    } else {
      importance.addClass("is-valid");
    }

    // Is deadlineDate a valid date?
    if (!validDate(taskInfo.deadlineDate)) {
      deadlineDate.addClass("is-invalid");
    } else {
      deadlineDate.addClass("is-invalid");
    }

    if (!hasErrors) {
      form.unbind().submit();
    } else {
      submitBtn.prop("disabled", false);
    }
  });
});
