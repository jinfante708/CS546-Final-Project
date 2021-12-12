const data = require('../data');
const tasksData = data.tasks;
const express = require('express');
const router = express.Router();
const verify = require("../data/verify");
let {ObjectId} = require('mongodb')
const tasklistData = require("../data/tasklists");
const userData = require("../data/users");
const xss = require("xss");
const uuid = require('uuid');

router.get('/tasksfortasklist/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
 
  try {  
     const id = validatetId(xss(req.params.id));
  
     const tasklist =  await tasklistData.getAllForAUser(req.session.user._id)
 
     if(!tasklist.includes(req.params.id))
     {
       throw "TasklistId not exists for the user"
      }
 
    const tasklists= await tasklistData.get(id)
    const  allTasks = await tasksData.getAll(tasklists.tasks)
    var t=[]
    for(i=0;i<allTasks.length;i++)
    {
      if (allTasks[i].isDeleted==false && allTasks[i].isCompleted==false  )
      {t.push(allTasks[i])}
    }
   res.render('tasklists/tasklist',{tasks:t, tasklistname: tasklists.listName, tasklistid: tasklists._id});
  } catch (e) {
   res.status(400).json({error: e});
  }
});



router.get('/addnewtask/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }


  try{
  
  const  id = validatetId(xss(req.params.id));
  
  const tasklist =  await tasklistData.getAllForAUser(req.session.user._id)
 
  if(!tasklist.includes(req.params.id))
  {
    throw "TasklistId not exists for the user in session"
   }
 
  res.render('tasks/add-task',{taskid: id});
  }  catch (e) {
    console.log(e)
    res.status(400).json({error: e});
  }
});

router.post('/complete/:id', async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }
 

  try {
    const id = validatetId(xss(req.params.id));
  
   const  tasklistid = await tasksData.gettasklistid(id)
       
  const tasklistforuser =  await tasklistData.getAllForAUser(req.session.user._id)
 
  if(!tasklistforuser.includes(tasklistid))
  {
    throw "TasklistId not exists for the user in session"
   }
 
    const completedtask = await tasksData.complete(id);


    res.redirect(`/tasks/tasksfortasklist/${tasklistid}`)
  } catch (e) {  
    res.status(400).json({error: e});
  }
  
});

router.post('/delete/:id', async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }

    try {
      const id = validatetId(xss(req.params.id));
    const  tasklistid = await tasksData.gettasklistid(id)
       
      const tasklistforuser =  await tasklistData.getAllForAUser(req.session.user._id)
     
      if(!tasklistforuser.includes(tasklistid))
      {
        throw "TasklistId not exists for the user in session"
       }
       
      const deletedtask = await tasksData.remove(id);
  
       res.redirect(`/tasks/tasksfortasklist/${tasklistid}`)
    } catch (e) {  
      res.status(400).json({error: e});
    }
  });

router.post('/', async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }
  const taskdetails = req.body;
   try {
    let {name, importance, deadlineDate} = taskdetails;
    if(!verify.validString(xss(name))){
      throw "Name is not valid";
  }
  
  name=name.trim()

  if(!verify.validDate(xss(deadlineDate)))
  {
    throw "Deadline date is Not a valid date";
  }

  importance  = parseInt(importance);

  // if(!verify.validNumber(xss(importance)))
  // {
  //   throw "Importance not a valid number";
  // }

   const newTask = await tasksData.create( req.session.user._id, name,  importance,  deadlineDate)
    const tasklist= await tasklistData.addTask(req.body.tasklistid,newTask._id)
     res.json(req.body.tasklistid)
   } catch (e) {
     console.log(e)
    res.status(500).json({error: e});
   }
 });

 
router.get('/edit/:id', async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }


  try {
    const id = validatetId(xss(req.params.id));
    const tasklistid = await tasksData.gettasklistid(id)
    const tasklistforuser =  await tasklistData.getAllForAUser(req.session.user._id)
    if(!tasklistforuser.includes(tasklistid))
    {
      throw "TasklistId not exists for the user in session"
     }
    const task = await tasksData.get(id);
     res.render('tasks/edit-task',{task: task} )
  } catch (e) {  
    res.status(500).json({error: e});
   
  }
});


router.get('/:id', async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }

  try {
    const id = validatetId(xss(req.params.id));
    const tasklistid = await tasksData.gettasklistid(id)
       
    const tasklistforuser =  await tasklistData.getAllForAUser(req.session.user._id)
   
    if(!tasklistforuser.includes(tasklistid))
    {
      throw "TasklistId not exists for the user in session"
     }

    const currenttask = await tasksData.get(id);
    res.status(200).json(currenttask);
  } catch (e) {   
    res.status(400).json({ error: e });
  }
});

router.put('/:id', async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/");
  }

  const taskdetails = req.body;
  try {
     const id = validatetId(xss(req.params.id));
     const tasklistid = await tasksData.gettasklistid(id)
       
     const tasklistforuser =  await tasklistData.getAllForAUser(req.session.user._id)
    
     if(!tasklistforuser.includes(tasklistid))
     {
       throw "TasklistId not exists for the user in session"
      }
      let { name,
        importance, 
        deadlineDate
       } = taskdetails;

  if(!verify.validString(xss(name))){
    throw "Name is not valid";
}

name=name.trim()

if(!verify.validDate(xss(deadlineDate)))
{
  throw "Deadline date is Not a valid date";
}

importance  = parseInt(importance);
// console.log(importance)
// console.log(typeof(importance))

// if(typeof(importance)!=number)
// {
//   throw "importance not a valid number"
// }

// if(!verify.validNumber(xss(importance)))
// {
//   throw "Importance not a valid number";
// }


      const updatedtask = await tasksData.update(id,
        name,
        importance, 
        deadlineDate
        )

     res.json({tasklistid: tasklistid})
    } catch (e) {
      res.status(400).json({ error: e });
     }
  });

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



module.exports = router;

