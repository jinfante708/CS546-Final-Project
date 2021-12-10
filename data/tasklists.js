const mongoCollections = require('../config/mongoCollections');
const taskLists = mongoCollections.tasklists;
const {ObjectId} = require('mongodb');
const userData = require('./users');
const taskData = require('./tasks');

const verify = require ('./verify');

const uuid = require ("uuid");//when in use, type _id = uuid.v4();

async function create(listName){
    if(!verify.validString(listName)){
        throw "listName is not valid";
    }

    const today = new Date();

    let year = today.getFullYear().toString();
    let month = (today.getMonth()+1).toString();//January is 0
    let day = today.getDate().toString();

    let createtionDate = `${month}/${day}/${year}`;

    const taskListCollection = await taskLists();

    let newTaskList = {
        _id: uuid.v4(),
        listName: listName,
        tasks: [],
        isDeleted: false,
        dateOfDeletion:'',
        dateOfCreation: createtionDate
    }

    const insertInfo = await taskListCollection.insertOne(newTaskList);

    if(insertInfo.insertedCount === 0){
        throw "cannot add taskList."
    }

    const id = insertInfo.insertedId;

    const taskList = await this.get(id);


    // trigger the function to add this list to the corresponding user


    return taskList;
}

async function getAll(){
    const taskListCollection = await taskLists();

    const AllTaskList = await taskListCollection.find({}).toArray();

    return AllTaskList;
}

async function get(id){
    if(!verify.validString(id)){
        throw "id is not valid string.";
    }

    const taskListCollection = await taskLists();
    
    const targetList = await taskListCollection.findOne({_id:id});

    if (targetList === null){
        throw "no task list with this id";
    }

    return targetList;

}

async function update(id, listName, tasks, isDeleted, dateOfDeletion){
    if(!verify.validString(id)){
        throw "id is invalid string.";
    }

    if(!verify.validString(listName)){
        throw "listName is invalid string.";
    }

    let oldList = await this.get(id);

    let dateOfCreation = oldList.dateOfCreation;

    const taskListCollection = await taskLists();

    const newList = {
        listName:listName,
        tasks: tasks,
        isDeleted: isDeleted,
        dateOfDeletion: dateOfDeletion,
        dateOfCreation: dateOfCreation
    }

    const updatedInfo = await taskListCollection.updateOne(
        {_id:id},
        {$set: newList}
    )

    if(updatedInfo.modifiedCount === 0){
        throw "cannot update successfully.";
    }

    return await this.get(id);

}

async function remove(id){
    if(!verify.validString(id)){
        throw "this id is invalid.";
    }

    const theList = await this.get(id);

    let name = theList.listName;
    let tasks = theList.tasks;

    const today = new Date();

    let year = today.getFullYear().toString();
    let month = (today.getMonth()+1).toString();//January is 0
    let day = today.getDate().toString();

    let deletionDate = `${month}/${day}/${year}`;

    await this.update(id, name, tasks, true, deletionDate);

    return await this.get(id);
}

function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const A = a.priority
    const B = b.priority
  
    let comparison = 0;
    if (A > B) {
      comparison = -1;
    } else if (A < B) {
      comparison = 1;
    }
    return comparison;
}

async function addTask(listId, taskID){

    const targetList = await this.get(listId);

    targetList.tasks.push(taskID);


    // probably need to sort based on priority score here

    let sortedList = targetList.tasks.sort(compare);

    return await this.update(listId, targetList.listName, sortedList, targetList.isDeleted, targetList.dateOfDeletion);

    
}



async function addListToUser(listId, userId){
    const user = await userData.get(userId);

    user.taskLsits.push(listId);
    
    
}

const today = new Date();//https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
// let year = today.getFullYear().toString();
// let month = today.getMonth().toString();
// let day = today.getDate().toString();

// let createtionDate = `${month}/${day}/${year}`;

// console.log(createtionDate);




// let year = today.substring(0,4);
// let month = today.substring(5,7);
// let day = today.substring(8,10);

// console.log(year);
// console.log(month);
// console.log(day);


module.exports = {
    create,
    getAll,
    get,
    update,
    remove,
    addTask
}