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
        if (
            !date ||
            !moment(date, "MM/DD/YYYY", true).isValid() ||
            moment(date, "MM/DD/YYYY").isBefore(moment())
        ) {
            hasErrors = true;
            return false;
        }

        return true;
    }

    let form = $("#edit-task-form");
    let id = $("#task-id");
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
            _id: id.val().trim(),
            name: name.val().trim(),
            importance: importance.val().trim(),
            deadlineDate: deadlineDate.val().trim(),
        };

        // console.log(taskInfo);
        // Client-side error checking for three fields

        // Is the task name a valid string?
        if (!validString(taskInfo.name)) {
            name.addClass("is-invalid");
        } else {
            name.addClass("is-valid");
        }

        // Is importance a valid number?
        if (!validFormNumber(taskInfo.importance)) {
            importance.addClass("is-invalid");
        } else {
            importance.addClass("is-valid");
        }

        // Is deadlineDate a valid date?
        if (!validDate(taskInfo.deadlineDate)) {
            deadlineDate.addClass("is-invalid");
        } else {
            deadlineDate.addClass("is-valid");
        }

        if (!hasErrors) {
            $.ajax({
                method: "PUT",
                url: `/tasks/${taskInfo._id}`,
                contentType: "application/json",
                data: JSON.stringify(taskInfo),
                beforeSend: function () {
                    $("#loader-container").removeClass("d-none");
                },
                success: function (data) {
                    window.location.href = `/tasks/tasksfortasklist/${data.tasklistid}`;
                },
                complete: function () {
                    $("#loader-container").addClass("d-none");
                },
                error: function (data) {
                    $("#error-message").html(data.responseJSON.error);
                    $("#error-message").removeClass("d-none");
                },
            });
        } else {
            submitBtn.prop("disabled", false);
        }
    });
});
