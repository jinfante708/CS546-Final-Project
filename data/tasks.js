const mongoCollections = require('../config/mongoCollections.js');
const tasks= mongoCollections.tasks;
const taskLists = mongoCollections.tasklists;
const xss = require("xss");
const uuid = require('uuid');
const { 
  v4: uuidv4,
} = require('uuid');
const verify = require ('./verify');
const taskListData = require('./tasklists');
const userData = require('./users');

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


let exportedMethods = {


  async gettasklistid(taskid,userid)
  {   userid = validatetId(xss(userid))
    const id = validatetId(xss(taskid)); 
    const taskListCollection = await taskLists();
    const alltasklist = await taskListCollection.find().toArray();
    let a
    alltasklist.forEach(element => {
      for(i=0;i<element.tasks.length;i++)
      { 
        if(element.tasks[i]==id && element.userId==userid)
        a =element._id
      }
    });
    if (a.length==0)
    {
      throw "no tasklist with given taskId"
    }
       return a;
  },


  async getAll(userId, tasklistId, ids){
  
     if(Array.isArray(ids)===false) 
     throw 'Ids must be an array'


     let a = []
  
     for(i=0;i<ids.length;i++)
     { 
      const Id = validatetId(xss(ids[i])); 
      a.push(Id)
     }


    for (let x of ids){
       const Id = validatetId(xss(x)); 

      let tempTask = await this.get(Id, userId);

      let tempListId = await this.gettasklistid(tempTask._id, userId);

      if(tempTask.userId !== userId || tempListId !== tasklistId){
        throw "these tasks don't belong to this user or don't belong to this task list.";
      }
    }

    const tasksCollection = await tasks();
    const alltasks = await tasksCollection.find({_id: { $in: a }}).toArray();
    PriorityInDescendingorder = alltasks.sort(compare);
    return PriorityInDescendingorder;
  },

  
  
 async get(id, userid){
  const Id = validatetId(xss(id)); 
   userid = validatetId(xss(userid)); 
  const tasksCollection = await tasks();
  const task= await tasksCollection.findOne({ _id: Id}, {userId: userid});
  if (!task) {
  throw "task not found"
  }
  return task
},

  async remove(id,userid){
    const Id = validatetId(xss(id)); 
    userid = validatetId(xss(userid))
    const tasksCollection = await tasks();
    let today = new Date();

    let date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
    
     let doc = await this.get(Id,userid)
      const updated = {     
        name: doc.name,
        urgency: doc.urgency, 
        importance: doc.importance, 
        startDate: doc.startDate, 
        deadlineDate: doc.deadlineDate, 
        completionDate: doc.completionDate, 
        isCompleted: doc.isCompleted, 
        isDeleted: true, 
        dateOfDeletion: date, 
        dateOfCreation: doc.dateOfCreation, 
        priority: doc.priority   
             };
              
             let updateInfo = await tasksCollection.updateOne(
               { _id: Id ,userId:userid},
               { $set: updated }
             );
             if (updateInfo.modifiedCount !== 1) {
              throw  "Could not update"
            
            }
       return {"taskID": Id, "deleted": true}
 },

  async complete(id,userid){
       const Id = validatetId(xss(id)); 
       userid=validatetId(xss(id))
        const tasksCollection = await tasks();
        let today = new Date();
    
        let date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
    
        
         let doc = await this.get(Id,userid)

          const updated = {     
            name: doc.name,
            urgency: doc.urgency, 
            importance: doc.importance, 
            startDate: doc.startDate, 
            deadlineDate: doc.deadlineDate, 
            completionDate: date , 
            isCompleted: true, 
            isDeleted: doc.isDeleted, 
            dateOfDeletion: date, 
            dateOfCreation: doc.dateOfCreation, 
            priority: doc.priority   
                 };
                 let updateInfo = await tasksCollection.updateOne(
                  { _id: Id },
                  { $set: updated }
                );
                 if (updateInfo.modifiedCount !== 1) {
                  throw "Could not update"
                
                }

           return {"taskID": Id, "completed": true}
          },

    async create(userId , name, importance, deadlineDate) {
    //  console.log("here")
      userId = validatetId(xss(userId)); 

      const targetUser = await userData.get(userId);
    
  

    if(!verify.validString(name))
    {
     throw "Name is not valid"
    }

    if(!verify.validDate(deadlineDate))
    {
      throw "Deadline date is Not a valid date";
    }


    importance  = parseInt(importance);

    if(!verify.validNumber(importance))
    {
      throw "Importance not a valid number";
    }

        const tasksCollection = await tasks();
  
     
    let arr =  deadlineDate.split("/");
     let today = new Date();
    // var HoursRightNow = today.getHours();
     
    let todaydate = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
  
    
    let deadlinemonth= arr[0]
    let deadlinedate = arr[1]
    let deadlineyear = arr[2]

      date2= new Date(deadlineyear,deadlinemonth-1,deadlinedate)
  
     const ONE_DAY = 1000 * 60 * 60 * 24;
     const differenceMs = Math.abs(today-date2);
     let urgencyformula = 24 * Math.round(differenceMs / ONE_DAY);
  
    
    let priorityformula =  Math.sqrt(Math.pow((240/urgencyformula), 2)+ Math.pow(importance,2))
    //sqrt(240/(deadline minus time right now in terms of hours)^2 + (importance(integer) input by user) ^2)
       
        let newtask = {
          _id: uuidv4(),
          userId: userId,
          name: name,
          urgency: urgencyformula,
          importance: importance, 
          startDate: todaydate, 
          deadlineDate: deadlineDate, 
          isCompleted: false, 
          isDeleted: false, 
          dateOfCreation: todaydate,
          priority:priorityformula 
        };
        
        const current = await tasksCollection.insertOne(newtask);
        const newid = current.insertedId;
   
        const task=  await tasksCollection.findOne({_id: newid})
       return task

  },


async update (id,name,importance, deadlineDate,userid){

  id = validatetId(xss(id)); 
 
  userId = validatetId(xss(userid)); 

  if(!verify.validString(name)){
    throw "Name is not valid";
}

name=name.trim()

if(!verify.validDate(deadlineDate))
{
  throw "Deadline date is Not a valid date";
}

importance  = parseInt(importance);

if(!verify.validNumber(importance))
{
  throw "Importance not a valid number";
}
  // console.log(name)
        const tasksCollection = await tasks();
         let doc = await this.get(id,userid)

        
    let arr =  deadlineDate.split("/");
    let today = new Date();
   // var HoursRightNow = today.getHours();
    
   let todaydate = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
   let deadlinemonth= arr[0]
   let deadlinedate = arr[1]
   let deadlineyear = arr[2]
     date2= new Date(deadlineyear,deadlinemonth-1,deadlinedate)
 
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const differenceMs = Math.abs(today-date2);

    
    let urgencyformula = 24 * Math.round(differenceMs / ONE_DAY);
 
    
   let priorityformula =  Math.sqrt(Math.pow((240/urgencyformula), 2)+ Math.pow(importance,2))
   //sqrt(240/(deadline minus time right now in terms of hours)^2 + (importance(integer) input by user) ^2)

    
        const updated = {
          _id: id,
          name: name,
          urgency: urgencyformula, 
          importance: importance, 
          startDate: doc.startDate, 
          deadlineDate: deadlineDate, 
          completionDate: doc.completionDate, 
          isCompleted: doc.isCompleted, 
          isDeleted: false, 
          dateOfDeletion: doc.dateOfDeletion, 
          dateOfCreation: doc.dateOfCreation,
          priority: priorityformula
        };
         

        let updateInfo = await tasksCollection.updateOne(
          { _id: id},
          { $set: updated }
        );

        if (updateInfo.modifiedCount !== 1) {
          throw  "Could not update "
         }
    
       return await this.get(id,userid);    
}
};

const validatetId = (_Id) => {
  if (!verify.validString(_Id)) {
    
      throw "Id passed is Not a valid id";
    
  }

  const Id = _Id.trim();

  const PROJECT_UUID_VERSION = 4;

  if (
    !uuid.validate(Id) ||
    uuid.version(Id) !== PROJECT_UUID_VERSION
  ) {
      throw "Id passed is Not a valid id";
  }

  return Id;
};

module.exports = exportedMethods;





