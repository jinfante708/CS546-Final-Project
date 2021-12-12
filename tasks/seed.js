const dbConnection = require("../config/mongoConnection");
const data = require("../data/");
const users = data.users;
const tasks = data.tasks;
const tasklists = data.tasklists;

async function main() {
  const db = await dbConnection.connectToDb();
  db.dropDatabase();

  const jayson = await users.create(
    "Jayson",
    "Infante",
    "jayson.infante708@gmail.com",
    "07/08/1999",
    "Jayson01!"
  );
  const jayson2 = await users.create(
    "Jayson",
    "Infante",
    "jsquaredcollabs@gmail.com",
    "07/08/1999",
    "Jayson01!"
  );

  // Creating two tasklists for Jayson 1
  const homework = await tasklists.create("Homework", jayson._id);
  const addHomework = await users.addTasklistToUser(jayson._id, homework._id);
  const chores = await tasklists.create("Chores", jayson._id);
  const addChores = await users.addTasklistToUser(jayson._id, chores._id);

  // Creating tasks for Jayson 1 - Homework
  const hw1 = await tasks.create(
    jayson._id,
    "CS 546 Final Project",
    10,
    "12/13/2021"
  );
  const addHw1 = await tasklists.addTask(homework._id, hw1._id);
  const hw2 = await tasks.create(
    jayson._id,
    "CS 511 Extra Credit",
    6,
    "12/10/2021"
  );
  const addHw2 = await tasklists.addTask(homework._id, hw2._id);

  // Creating tasks for Jayson 1 - Chores
  const chore1 = await tasks.create(
    jayson._id,
    "Get groceries",
    8,
    "12/13/2021"
  );
  const addChore1 = await tasklists.addTask(chores._id, chore1._id);
  const chore2 = await tasks.create(
    jayson._id,
    "Get a haircut",
    5,
    "12/20/2021"
  );
  const addChore2 = await tasklists.addTask(chores._id, chore2._id);

  // Creating two tasklists for Jayson 2
  const homework2 = await tasklists.create("Homework", jayson2._id);
  const addHomework2 = await users.addTasklistToUser(
    jayson2._id,
    homework2._id
  );
  const chores2 = await tasklists.create("Chores", jayson2._id);
  const addChores2 = await users.addTasklistToUser(jayson2._id, chores2._id);

  // Creating tasks for Jayson 2 - Homework
  const hw3 = await tasks.create(
    jayson2._id,
    "CS 546 Final Project",
    10,
    "12/13/2021"
  );
  const addHw3 = await tasklists.addTask(homework2._id, hw3._id);
  const hw4 = await tasks.create(
    jayson2._id,
    "CS 511 Extra Credit",
    6,
    "12/10/2021"
  );
  const addHw4 = await tasklists.addTask(homework2._id, hw4._id);

  // Creating tasks for Jayson 2 - Chores
  const chore3 = await tasks.create(
    jayson2._id,
    "Get groceries",
    8,
    "12/13/2021"
  );
  const addChore3 = await tasklists.addTask(chores2._id, chore3._id);
  const chore4 = await tasks.create(
    jayson2._id,
    "Get a haircut",
    5,
    "12/20/2021"
  );
  const addChore4 = await tasklists.addTask(chores2._id, chore4._id);

  const db2 = await dbConnection.connectToDb();
  await dbConnection.closeConnection();
}

main().catch((error) => {
  console.log(error);
});
