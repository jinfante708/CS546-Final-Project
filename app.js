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
const mongoCollections = require("./config/mongoCollections");
const users = mongoCollections.users;
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
// Perhaps we can add the user id to the task collection schema? This is more SQLesque though, not
// much of a MongoDB schema (Since it's like a foreign key)
// cron.schedule("* * 07 * * *", () => {
cron.schedule("*/20 * * * * *", () => {
  //This will fire the email every minute lol
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error("Failed to create a testing account. " + err.message);
      return process.exit(1);
    }

    console.log("Credentials obtained, sending message...");
    console.log(account.user);
    console.log(account.pass);

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    });

    let message = {
      from: process.env.user,
      to: account.user,
      subject: "Test Email",
      text: "Hello world!",
      html: "<h1>Hello world!</h1>",
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(e);
        return process.exit(1);
      }

      console.log("Message sent: %s", info.messageId);
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
    // const usersCollection = await users();
    // for (let user of usersCollection) {
    //   let name = user.firstName;
    //   let email = user.email;
    //   let tasklists = user.tasklists;
    //   for (let tasklistId of tasklists) {
    //     let tasklist = tasklistsData.get(tasklistId);
    //     let tasklistName = tasklist.listName;
    //     let tasks = tasklist.tasks;
    //     for (let taskId of tasks) {
    //       let task = tasksData.get(taskId);
    //       let taskName = task.name;
    //       // Deadline date should be in MM/DD/YYYY format
    //       let deadline = task.deadlineDate;
    //       let tomorrow = moment().add(1, "days").format("MM/DD/YYYY");
    //       if (deadline === tomorrow) {
    //         // Send email for specific task
    //         let message = {
    //           from: process.env.user,
    //           to: email,
    //           subject: "Task Deadline Reminder",
    //           text: `Good morning ${name}, A friendly reminder that your deadline for the task
    //           ${taskName} in the task list ${tasklistName} is due tomorrow (${tomorrow}). Good luck!`,
    //           html: `<p>Good morning ${name},</p>
    //                  <p>A friendly reminder that your deadline for the task
    //                  ${taskName} in the task list ${tasklistName} is due tomorrow (${tomorrow}).</p>
    //                  <p>Good luck!</p>`,
    //         };

    //         transporter.sendMail(message, (err, info) => {
    //           if (err) {
    //             console.log("Error occurred. " + err.message);
    //             return process.exit(1);
    //           }

    //           console.log("Message sent: %s", info.messageId);
    //         });
    //       }
    //     }
    //   }
    // }
  });
});

app.listen(PORT, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${PORT}`);
});
