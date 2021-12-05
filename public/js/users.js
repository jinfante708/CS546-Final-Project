(function ($) {
    let hasErrors = false;

    $(document).on("submit", "form#signup-form", function (event) {
        event.preventDefault();

        hasErrors = false;

        $("#error-message").addClass("d-none");

        const firstName = $("#firstName");
        const lastName = $("#lastName");
        const email = $("#email");
        const dateOfBirth = $("#dateOfBirth");
        const password = $("#password");

        const user = {
            firstName: firstName.val().trim(),
            lastName: lastName.val().trim(),
            email: email.val().trim(),
            dateOfBirth: dateOfBirth.val().trim(),
            password: password.val(),
        };

        $("input").removeClass("is-invalid is-valid");

        validUserIdentity(user.firstName)
            ? firstName.addClass("is-valid")
            : firstName.addClass("is-invalid");

        validUserIdentity(user.lastName)
            ? lastName.addClass("is-valid")
            : lastName.addClass("is-invalid");

        validEmail(user.email)
            ? email.addClass("is-valid")
            : email.addClass("is-invalid");

        validDateOfBirth(user.dateOfBirth)
            ? dateOfBirth.addClass("is-valid")
            : dateOfBirth.addClass("is-invalid");

        validPassword(user.password)
            ? password.addClass("is-valid")
            : password.addClass("is-invalid");

        if (hasErrors) {
            return;
        }

        user.dateOfBirth = moment(user.dateOfBirth).format("MM/DD/YYYY");

        submitSignUpForm(user);
    });

    $(document).on("click", "button#show-password", function () {
        $("#password").attr(
            "type",
            $("#password").attr("type") === "password" ? "text" : "password"
        );

        $(this).html($(this).html() === "Show" ? "Hide" : "Show");
    });

    function submitSignUpForm(user) {
        $.ajax({
            url: "/users/signup",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            beforeSend: function () {
                $("#loader-container").removeClass("d-none");
            },
            success: function () {
                window.location.href = "/users";
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

    $(document).on("submit", "form#login-form", function (event) {
        event.preventDefault();

        hasErrors = false;

        $("#error-message").addClass("d-none");

        const email = $("#email");
        const password = $("#password");

        const user = {
            email: email.val().trim(),
            password: password.val(),
        };

        $("input").removeClass("is-invalid is-valid");

        validEmail(user.email)
            ? email.addClass("is-valid")
            : email.addClass("is-invalid");

        validPassword(user.password)
            ? password.addClass("is-valid")
            : password.addClass("is-invalid");

        if (hasErrors) {
            return;
        }

        submitLoginForm(user);
    });

    function submitLoginForm(user) {
        $.ajax({
            url: "/users/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            beforeSend: function () {
                $("#loader-container").removeClass("d-none");
            },
            success: function () {
                window.location.href = "/";
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

    function validUserIdentity(name) {
        if (validator.isEmpty(name)) {
            hasErrors = true;
            return false;
        }

        //should match alphabetical characters and spaces
        const nameRegex = /[^a-zA-Z ]/;

        if (nameRegex.test(name)) {
            hasErrors = true;
            return false;
        }

        return true;
    }

    function validEmail(email) {
        if (validator.isEmpty(email)) {
            hasErrors = true;
            return false;
        }

        if (!validator.isEmail(email)) {
            hasErrors = true;
            return false;
        }

        return true;
    }

    function validDateOfBirth(dateOfBirth) {
        if (validator.isEmpty(dateOfBirth)) {
            hasErrors = true;
            return false;
        }

        const correctFormattedDate = moment(dateOfBirth).format("MM/DD/YYYY");

        if (!moment(correctFormattedDate, "MM/DD/YYYY", true).isValid()) {
            hasErrors = true;
            return false;
        }

        if (
            !moment(correctFormattedDate, "MM/DD/YYYY").isBefore(
                moment(),
                "day"
            )
        ) {
            hasErrors = true;
            return false;
        }

        return true;
    }

    function validPassword(password) {
        if (validator.isEmpty(password)) {
            hasErrors = true;
            return false;
        }

        const MINIMUM_PASSWORD_LENGTH = 8;

        if (password.length < MINIMUM_PASSWORD_LENGTH) {
            hasErrors = true;
            return false;
        }

        //should match alphanumeric characters, special characters and no spaces
        const passwordRegex = /[^\S]/;

        if (passwordRegex.test(password)) {
            hasErrors = true;
            return false;
        }

        return true;
    }
})(jQuery);
