const mongoCollections = require('../config/mongoCollections');
const taskLists = mongoCollections.tasklists;
const {ObjectId} = require('mongodb');
const userData = require('./users');

const verify = require ('./verify');

const uuid = require ("uuid");//when in use, type _id = uuid.v4();
const xss = require("xss");


const validateUserId = (_userId) => {
    if (!verify.validString(_userId)) {
      throw "id should not be empty.";
    }
  
    const userId = _userId.trim();
  
    const PROJECT_UUID_VERSION = 4;
  
    if (!uuid.validate(userId) || uuid.version(userId) !== PROJECT_UUID_VERSION) {
      throw "this is not a valid id.";
    }
  
    return userId;
};


const validateTasklistId = (_tasklistId) => {
    if (!verify.validString(_tasklistId)) {
      throw "task list id should not be empty.";
    }
  
    const tasklistId = _tasklistId.trim();
  
    const PROJECT_UUID_VERSION = 4;
  
    if (
      !uuid.validate(tasklistId) ||
      uuid.version(tasklistId) !== PROJECT_UUID_VERSION
    ) {
      throw "task list id is not a valid id.";
    }
  
    return tasklistId;
  };



async function create(listName, userId){

    listName = listName.trim();
    if(!verify.validString(listName)){
        throw "listName is not valid";
    }

    if(!verify.validString(userId)){
        throw "userId is not valid";
    }


    let userId2 = xss(userId);

    if(!uuid.validate(userId2)){
        throw "userId is not a valid id.";
    }

    const today = new Date();

    let year = today.getFullYear().toString();
    let month = (today.getMonth()+1).toString();//January is 0
    let day = today.getDate().toString();

    let createtionDate = `${month}/${day}/${year}`;

    const taskListCollection = await taskLists();

    let newTaskList = {
        _id: uuid.v4(),
        userId: userId2,
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


async function checkDuplicate(userId, listName){

    if(!verify.validString(userId)){
        throw "userId is not a valid string.";
    }
    let userId2 = xss(userId);

    if(!uuid.validate(userId2)){
        throw "userId is not a valid id."
    }



    listName = listName.trim();
    if(!verify.validString(listName)){
        throw "listName is not valid";
    }

    const allLists = await this.getAllForAUser(userId2);

    for(let x of allLists){

        let tempList = await this.get(x);

        if(listName.toLowerCase() === tempList.listName.toLowerCase()){
            return true;
        }
    }

    return false;

}

async function getAll(){
    const taskListCollection = await taskLists();

    const AllTaskList = await taskListCollection.find({}).toArray();

    return AllTaskList;
}

async function getAllForAUser(userId){
    if(!verify.validString(userId)){
        throw "userId is not valid string.";
    }

    let userId2 = xss(userId);

    if(!uuid.validate(userId2)){
        throw "user id is not a valid id.";
    }


    const targetUser = await userData.get(userId2);

    const targetList = targetUser.taskLists;
    
    return targetList;
}

async function get(id){
    if(!verify.validString(id)){
        throw "id is not valid string.";
    }

    let id2 = xss(id);

    if(!uuid.validate(id2)){
        throw "this id is not a valid id.";
    }

    const taskListCollection = await taskLists();
    
    const targetList = await taskListCollection.findOne({_id:id2});

    if (targetList === null){
        throw "no task list with this id";
    }

    return targetList;

}

async function update(id, listName, tasks, isDeleted, dateOfDeletion){
    if(!verify.validString(id)){
        throw "id is invalid string.";
    }

    if(!uuid.validate(id)){
        throw "this id is not a valid id.";
    }

    if(!verify.validString(listName)){
        throw "listName is invalid string.";
    }


    if(!tasks){
        throw "you need to provide tasks.";
    }

    if(!isDeleted){
        throw "you need to provide isDeleted.";
    }

    if(!dateOfDeletion){
        throw "you need to provide dateOfDeletion";
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





module.exports = {
    create,
    getAll,
    get,
    addTask,
    getAllForAUser,
    checkDuplicate,
    update
}