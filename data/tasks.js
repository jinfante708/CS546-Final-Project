const mongoCollections = require('../config/mongoCollections.js');
const tasks= mongoCollections.tasks;
const uuid = require('uuid');
const { 
  v4: uuidv4,
} = require('uuid');


let exportedMethods = {
    async create(name, urgency, importance, startDate, deadlineDate, completionDate,  dateOfDeletion, priority) {
        const tasksCollection = await tasks();
        name=name.trim()

     let today = new Date();

    let date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();

        let newtask = {
          _id: uuidv4(),
          name: name,
          urgency: urgency, 
          importance: importance, 
          startDate: startDate, 
          deadlineDate: deadlineDate, 
          completionDate: completionDate, 
          isCompleted: false, 
          isDeleted: false, 
          dateOfDeletion: dateOfDeletion, 
          dateOfCreation: date,
          priority: priority
        };
        
        const current = await tasksCollection.insertOne(newtask);
        const newid = current.insertedId;
   
        const task=  await tasksCollection.findOne({_id: newid})
       return task

  },

  async getAll(){

    const tasksCollection = await tasks();
    const alltasks = await tasksCollection.find({}).toArray();
   
    return alltasks;
    
  },


  async get(id){
  
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
            
         
           // return await this.get(id);    

       return {"taskID": id, "deleted": true}
      },

async update (id,name, urgency,  importance,  startDate,  deadlineDate,  completionDate,  isCompleted, dateOfDeletion, dateOfCreation, priority){
        const tasksCollection = await tasks();
   
        id=id.trim()
        name=name.trim()

  

        const updated = {
          _id: id,
          name: name,
          urgency: urgency, 
          importance: importance, 
          startDate: startDate, 
          deadlineDate: deadlineDate, 
          completionDate: completionDate, 
          isCompleted: isCompleted, 
          isDeleted: false, 
          dateOfDeletion: dateOfDeletion, 
          dateOfCreation: dateOfCreation,
          priority: priority
        };
         

        let updateInfo = await tasksCollection.updateOne(
          { _id: id},
          { $set: updated }
        );
    
       return await this.get(id);    
}



};

module.exports = exportedMethods;
