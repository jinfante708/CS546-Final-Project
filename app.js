const express = require("express");
const cron = require("node-cron");
const session = require("express-session");
const configRoutes = require("./routes");
const { engine } = require("express-handlebars");

const static = express.static(__dirname + "/public");
const app = express();

const PORT = 3000;

app.use("/public", static);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(
  session({
    name: "AuthCookie",
    secret: `There !$ /\/0 $ecret f0r /\/\Y $e$$!0/\/`,
    resave: false,
    saveUninitialized: true,
  })
);

configRoutes(app);

// Run email reminder every 24 hours at 7 AM
// This is a costly operation but it only happens once a day
// Perhaps we can add the user id to the task collection schema? This is more SQLesque though, not
// much of a MongoDB schema (Since it's like a foreign key)
cron.schedule("* * 07 * * *", () => {
  /* Loop through users
        - Grab their first name
        - Grab their email
            First inner loop to grab their tasklists 
                - Grab name of the tasklist (Perhaps this isn't needed)
                    Second inner loop to grab all the tasks from a tasklist 
                        - the name of the task
                        - check if the deadline is tomorrow
                        - if so, then send an email to {{email}} saying "Good morning {{firstName}},
                           A friendly reminder that your deadline for the task {{task_name}} in the
                           task list {{tasklistName}} is due tomorrow ({{Insert tomorrow's date here}})!"
    */
});

app.listen(PORT, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${PORT}`);
});
