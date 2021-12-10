const tasklistsRoutes = require("./tasklists");
const tasksRoutes = require("./tasks");
const usersRoutes = require("./users");
const path = require("path");

const constructorMethod = (app) => {
    app.use("/tasklists", tasklistsRoutes);
    app.use("/tasks", tasksRoutes);
    app.use("/users", usersRoutes);
    app.get("/", (request, response) => {
        return response.render("home", { pageTitle: "Home" });
    });
    app.get("/getStarted", (request, response) => {
        if (request.session.user) {
            return response.redirect("/tasklists");
        } else {
            return response.redirect("/users/signup");
        }
    });

    //for accessing unknown routes
    app.use("*", (request, response) => {
        response
            .status(404)
            .sendFile(path.resolve("static/page-not-found.html"));
    });

    //for invalid URI
    app.use(function (error, request, response, next) {
        response
            .status(404)
            .sendFile(path.resolve("static/page-not-found.html"));
    });
};

module.exports = constructorMethod;
