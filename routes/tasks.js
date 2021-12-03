const data = require('../data');
const tasksData = data.tasks;
const express = require('express');
const router = express.Router();
let {ObjectId} = require('mongodb')


router.post('/', async (req, res) => {
 const taskdetails = req.body;

  try {
    const {name, importance, deadlineDate} = taskdetails;
    const newTask = await tasksData.create( name,  importance,  deadlineDate)
    res.status(200).json(newTask);
  } catch (e) {
      console.log(e)
    res.status(400).json({ error: e });
  }
});

router.get('/', async (req, res) => {
  try {
    const allTasks = await tasksData.getAll()
    res.status(200).json(allTasks);
  } catch (e) {
    res.status(400).json({ error: e });
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
      res.status(200).json(updatedtask);
    } catch (e) {
    console.log(e)
      res.status(400).json({ error: e });
    }
  });

router.put('/delete/:id', async (req, res) => {

  try {
    const deletedtask = await tasksData.remove(req.params.id);
    res.status(200).json(deletedtask);
  } catch (e) {  
    res.status(400).json({ message: e});
  }
});


module.exports = router;