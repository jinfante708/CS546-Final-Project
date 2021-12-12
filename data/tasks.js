const mongoCollections = require('../config/mongoCollections.js');
const tasks= mongoCollections.tasks;
const taskLists = mongoCollections.tasklists;
const uuid = require('uuid');
const { 
  v4: uuidv4,
} = require('uuid');
const verify = require ('./verify');
const taskListData = require('./tasklists');


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

  async gettasklistid(taskid)
  {
    const taskListCollection = await taskLists();
    const alltasklist = await taskListCollection.find().toArray();
    let a
    alltasklist.forEach(element => {
      for(i=0;i<element.tasks.length;i++)
      {
        if(element.tasks[i]==taskid)
        a =element._id
      }
    });
    return a;
    // const task= await taskListCollection.findOne({taskid: { $in: tasks}});
    // console.log(task)
    //const alltasks = await tasksCollection.find({_id: { $in: }}).toArray();
  },

  async getAll(userId, tasklistId, ids){

    // //the ids are an array of task ids.
    // const allListsForUser = taskListData.getAllForAUser(userId);

    // let listBelongUser = false;
    // for(let x of allListsForUser){
    //   if(x._id === tasklistId){
    //     listBelongUser = true;
    //   }
    // }

    // if (listBelongUser === false){
    //   throw "this list doesn't belong to this user.";
    // }

    // const targetList = taskListData.get(tasklistId);

    // let allTasksForList = targetList.tasks;

    // let tasksBelongList = false;

    // for (let y of ids){
    //   tasksBelongList =false;

    //   for (let z of allTasksForList){
    //     if (z === y){
    //       tasksBelongList = true;
    //       continue;
    //     }
    //   }
    // }

    // if(tasksBelongList === false){
    //   throw "some tasks in this list doesn't belong to its corresponding list.";
    // }


    for (let x of ids){
      let tempTask = await this.get(x);

      if(tempTask.userId !== userId || tempTask.taskListId !== tasklistId){
        throw "these tasks don't belong to this user or don't belong to this task list.";
      }
    }

    const tasksCollection = await tasks();
    const alltasks = await tasksCollection.find({_id: { $in: ids }}).toArray();
    PriorityInDescendingorder = alltasks.sort(compare);
    return PriorityInDescendingorder;
  },

  
 async get(id){
  //  console.log(id)
  id=id.trim()
  const tasksCollection = await tasks();
  const task= await tasksCollection.findOne({ _id: id});
  return task
},


  async remove(id){
    const tasksCollection = await tasks();
    let today = new Date();

    let date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
    
     let doc = await this.get(id)
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
               { _id: id },
               { $set: updated }
             );
       return {"taskID": id, "deleted": true}
 },

  async complete(id){
        const tasksCollection = await tasks();
        let today = new Date();
    
        let date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
        
         let doc = await this.get(id)
          const updated = {     
            name: doc.name,
            urgency: doc.urgency, 
            importance: doc.importance, 
            startDate: doc.startDate, 
            deadlineDate: doc.deadlineDate, 
            completionDate: doc.completionDate, 
            isCompleted: true, 
            isDeleted: doc.isDeleted, 
            dateOfDeletion: date, 
            dateOfCreation: doc.dateOfCreation, 
            priority: doc.priority   
                 };
                  
                 let updateInfo = await tasksCollection.updateOne(
                   { _id: id },
                   { $set: updated }
                 );
           return {"taskID": id, "completed": true}
          },


    async create(name, importance, deadlineDate) {
      if(!verify.validString(name)){
        throw "Name is not valid";
    }
    if(!verify.validDate(deadlineDate))
    {
      throw "Deadline date is Not a valid date";
    }

    // if(!verify.validNumber(importance))
    // {
    //   throw "Importance not a valid number";
    // }
        const tasksCollection = await tasks();
        name=name.trim()
     
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
          //userId: userId,
          //taskListId: taskListId,
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



async update (id,name,importance, deadlineDate){
  // console.log(name)
        const tasksCollection = await tasks();
        if(!verify.validString(name)){
          throw "Name is not valid";
      }
      if(!verify.validDate(deadlineDate))
      {
        throw "Deadline date is Not a valid date";
      }
  
      // if(!verify.validNumber(importance))
      // {
      //   throw "Importance not a valid number";
      // }
        
         let doc = await this.get(id)
  
        id=id.trim()
        name=name.trim()

        
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
    
       return await this.get(id);    
}
};

module.exports = exportedMethods;
