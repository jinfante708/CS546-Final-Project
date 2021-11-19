const tasklistsRoutes = require("./tasklists");
const tasksRoutes = require("./tasks");
const usersRoutes = require("./users");

const constructorMethod = (app) => {
  app.use("/taskslists", tasklistsRoutes);
  // app.use("/tasks", tasksRoutes);
  // app.use("./users", usersRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
};

module.exports = constructorMethod;
