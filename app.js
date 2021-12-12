const express = require("express");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const session = require("express-session");
const configRoutes = require("./routes");
const { engine } = require("express-handlebars");

const static = express.static(__dirname + "/public");
const app = express();

const PORT = 3000;

const data = require("./data");
const usersData = data.users;
const tasklistsData = data.tasklists;
const tasksData = data.tasks;

require("dotenv").config();

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
cron.schedule("* * 07 * * *", async () => {
  // Create a SMTP transporter object
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

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
  const users = await usersData.getAll();
  for (let user of users) {
    let user = user._id;
    let name = user.firstName;
    let email = user.email;
    let tasklists = user.taskLists;
    for (let tasklistId of tasklists) {
      let tasklist = tasklistsData.get(tasklistId);
      let tasklistName = tasklist.listName;
      let tasks = tasklist.tasks;
      for (let taskId of tasks) {
        let task = tasksData.get(taskId, userId);
        let taskName = task.name;
        // Deadline date should be in MM/DD/YYYY format
        let deadline = task.deadlineDate;
        let formattedDeadline = moment(Date.parse(deadline)).format(
          "MM/DD/YYYY"
        );
        let tomorrow = moment().add(1, "days").format("MM/DD/YYYY");
        if (formattedDeadline === tomorrow) {
          // Send email for specific task
          let message = {
            from: process.env.user,
            to: email,
            subject: "Task Deadline Reminder",
            text: `Good morning ${name}, A friendly reminder that your deadline for the task
              ${taskName} in the task list ${tasklistName} is due tomorrow (${tomorrow}). Good luck!`,
            html: `<p>Good morning ${name},</p>
                     <p>A friendly reminder that your deadline for the task
                     ${taskName} in the task list ${tasklistName} is due tomorrow (${tomorrow}).</p>
                     <p>Good luck!</p>`,
          };

          transporter.sendMail(message, (err, info) => {
            if (err) {
              console.log(e);
              return process.exit(1);
            }

            console.log("Message sent: %s", info.messageId);
          });
        }
      }
    }
  }
});

app.listen(PORT, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${PORT}`);
});
