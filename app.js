const express = require("express");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
let smtpTransport = require("nodemailer-smtp-transport");
const session = require("express-session");
const configRoutes = require("./routes");
const { engine } = require("express-handlebars");
const moment = require("moment");

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

//used for removing cache and handling back buttons after sign-ups or logins
app.use(function (request, response, next) {
  response.header(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate"
  );
  response.header("Expires", "-1");
  response.header("Pragma", "no-cache");
  next();
});

app.use(
  session({
    name: "AuthCookie",
    secret: `There !$ /\/0 $ecret f0r /\/\Y $e$$!0/\/`,
    resave: false,
    saveUninitialized: true,
  })
);

//Changing request method
app.use(function (request, response, next) {
  if (request.body && request.body._method) {
    request.method = request.body._method;
    delete request.body._method;
  }

  next();
});

configRoutes(app);

// Run email reminder every 24 hours at 7 AM
// This is a costly operation but it only happens once a day
cron.schedule("* * 07 * * *", async () => {
  // Create a SMTP transporter object
  let transporter = nodemailer.createTransport(
    smtpTransport({
      service: "Gmail",
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    })
  );
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
  try {
    const users = await usersData.getAll();
    for (let user of users) {
      let userId = user._id;
      let name = user.firstName;
      let email = user.email;
      let tasklists = user.taskLists;
      for (let tasklistId of tasklists) {
        let tasklist = await tasklistsData.get(tasklistId);
        let tasklistName = tasklist.listName;
        let tasks = tasklist.tasks;
        for (let taskId of tasks) {
          let task = await tasksData.get(taskId, userId);
          let taskName = task.name;
          // Deadline date should be in MM/DD/YYYY format
          let deadline = String(task.deadlineDate);
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
                console.log(err);
                return process.exit(1);
              }

              console.log("Message sent: %s", info.messageId);
            });
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.listen(PORT, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${PORT}`);
});
