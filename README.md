# CS 546: Web Progamming I - Final Project (Task Prioritization)
A task prioritization application to aide users with multi-tasking by generating priority scores to each of their tasks.

Built using HTML, CSS, Bootstrap, Express, Node.js, and MongoDB.

## How to Setup
Run 'npm install' to install the required dependencies for our project.  

Then run 'npm run seed' to run the task of seeding the database.

Afterwards run 'npm start' to host the website on your local machine (http://localhost:3000/).

## How the Application Works
- Upon loading the website, the first page will be the landing page.
- A non-authenticated user will only be able to view our landing page which outlines the features of our site (Task priority, User Statistics, Email Reminders)
- Only a logged in, or authenicated, user will be able to create tasklists and individual tasks. 
- In addition, an authenticated user will be able to view their own profile which includes information about their account and personal user statistics.

## Email reminders
This web application sends out email reminders for a task the day before its deadline date via two npm packages, `nodemailer` and `cron`. However, you must set up an email that will act as the host to actually send the deadline reminders. The username and password of the email you use will be stored in an environment file, which is simplified with the npm package `dotenv`. This avoids posting your email credentials on your public github repo as the environment file is included in the `.gitignore` file.

To do this, create a file `env` in the root directory.

Add two lines to this file, which will be environment variables for the username/password of your email.

user={email_username}
pass={email_password}
