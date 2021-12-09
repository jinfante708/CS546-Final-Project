const data = require('../data');
const tasksData = data.tasks;
const express = require('express');
const router = express.Router();
const verify = require("../data/verify");
let {ObjectId} = require('mongodb')

router.get('/', async (req, res) => {
  try {
    const allTasks = await tasksData.getAll()
    var t=[]
    for(i=0;i<allTasks.length;i++)
    {
      if (allTasks[i].isDeleted==false && allTasks[i].isCompleted==false  )
      {t.push(allTasks[i])}
    }
  res.render('tasklists/upcoming',{tasks:t});
  } catch (e) {
    res.status(400).json({ error: e });
  }
});


router.get('/addnewtask', async (req, res) => {
  res.render('tasks/add-task');
});

router.post('/complete/:id', async (req, res) => {
  try {
    const completedtask = await tasksData.complete(req.params.id);
     res.redirect('/tasks/')
  } catch (e) {  
    res.status(400).json({ message: e});
  }
});

router.post('/delete/:id', async (req, res) => {
    try {
      const deletedtask = await tasksData.remove(req.params.id);
       res.redirect('/tasks/')
    } catch (e) {  
      res.status(400).json({ message: e});
    }
  });

router.post('/', async (req, res) => {
  const taskdetails = req.body;
 
   try {
     const {name, importance, deadlineDate} = taskdetails;
     const newTask = await tasksData.create( name,  importance,  deadlineDate)
   } catch (e) {
       console.log(e)
     res.status(400).json({ error: e });
   }
 });

 
router.get('/edit/:id', async (req, res) => {
  try {
    const task = await tasksData.get(req.params.id);
     res.render('tasks/edit-task',{task: task} )
  } catch (e) {  
    res.status(400).json({ message: e});
  }
});



router.get('/:id', async (req, res) => {

  try {
    const currenttask = await tasksData.get(req.params.id);
    res.status(200).json(currenttask);
  } catch (e) {   
    res.status(400).json({ error: e });
  }
});

router.put('/:id', async (req, res) => {
  const taskdetails = req.body;
  try {
      const { name,
        importance, 
        deadlineDate
       } = taskdetails;
      const updatedtask = await tasksData.update(req.params.id,
        name,
        importance, 
        deadlineDate
        )
  
    res.redirect('/tasks')
    } catch (e) {
    console.log(e)
      res.status(400).json({ error: e });
     }
  });






module.exports = router;