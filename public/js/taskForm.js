(function ($) {
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

  function validFormNumber(num) {
    if (!num || isNaN(num) || num < 1 || num > 10) {
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

    // console.log(taskInfo);
    // Client-side error checking for three fields

    // Is the task name a valid string?
    if (!validString(taskInfo.name)) {
      name.addClass("is-invalid");
      console.log("invalid name path hit");
    } else {
      console.log("valid name path hit");
      name.addClass("is-valid");
    }

    // Is importance a valid number?
    if (!validFormNumber(taskInfo.importance)) {
      importance.addClass("is-invalid");
      console.log("invalid number path hit");
    } else {
      console.log("valid number path hit");
      importance.addClass("is-valid");
    }

    // Is deadlineDate a valid date?
    if (!validDate(taskInfo.deadlineDate)) {
      deadlineDate.addClass("is-invalid");
      console.log("invalid deadline path hit");
    } else {
      deadlineDate.addClass("is-valid");
      console.log("valid deadline path hit");
    }

    if (!hasErrors) {
      // unbind() is deprecated, use .off() instead
      //form.off().submit();
      submitnewtaskform(taskInfo);
    } else {
      submitBtn.prop("disabled", false);
    }
  });
});

function submitnewtaskform(taskInfo) {
  $.ajax({
      url: '/tasks',
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(taskInfo),
      beforeSend: function () {
          $("#loader-container").removeClass("d-none");
      },
      success: function () {
          window.location.href = "/tasks";
      },
      complete: function () {
          $("#loader-container").addClass("d-none");
      },
      error: function (data) {
          $("#error-message").html(data.responseJSON.error);
          $("#error-message").removeClass("d-none");
      },
  });
}

})(jQuery);
