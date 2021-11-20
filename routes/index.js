const tasklistsRoutes = require("./tasklists");
const tasksRoutes = require("./tasks");
const usersRoutes = require("./users");

const constructorMethod = (app) => {
    app.use("/taskslists", tasklistsRoutes);
    app.use("/tasks", tasksRoutes);
    app.use("/users", usersRoutes);

    //for accessing unknown routes
    app.use("*", (request, response) => {
        response.status(404).json({ serverResponse: "Not found." });
    });

    //for invalid URI
    app.use(function (error, request, response, next) {
        response
            .status(error.statusCode)
            .json({ serverResponse: "Bad Request." });
    });
};

module.exports = constructorMethod;
