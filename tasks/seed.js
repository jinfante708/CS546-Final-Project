const dbConnection = require("../config/mongoConnection");
const data = require("../data/");
const users = data.users;
const tasks = data.tasks;
const tasklists = data.tasklists;

async function main() {
  const db = await dbConnection.connectToDb();
  db.dropDatabase();

  const jayson = users.create(
    "Jayson",
    "Infante",
    "jayson.infante708@gmail.com",
    "07/08/1999",
    "Jayson01!"
  );
  const keye = users.create(
    "Keye",
    "Li",
    "keye.li@gmail.com",
    "05/22/2000",
    "KeyeLi01!"
  );

  const db2 = await dbConnection.connectToDb();
  await dbConnection.closeConnection();
}

main().catch((error) => {
  console.log(error);
});
