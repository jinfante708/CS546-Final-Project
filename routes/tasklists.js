const express = require('express');
const router = express.Router();
const data = require('../data');
const taskListsData = data.tasklists;
const taskData = data.tasks;
const userData = data.users;
const verify = require("./verify");
const uuid = require("uuid");
const xss = require("xss");

const validateTasklistId = (_tasklistId) => {
    if (!verify.validString(_tasklistId)) {
      throw "this tasklist id is invalid.";
    }
  
    const tasklistId = _tasklistId.trim();
  
    const PROJECT_UUID_VERSION = 4;
  
    if (
      !uuid.validate(tasklistId) ||
      uuid.version(tasklistId) !== PROJECT_UUID_VERSION
    ) {
     throw "this tasklist id is invalid.";
    }
  
    return tasklistId;
};

router.get('/', async (req,res) =>{


    if(!req.session.user){
        // should just redirect to homepage.
        // res.status(400).json({error: 'user does not exists.'});
        res.redirect('/');
        return;
    }

    if(!userData.valid)

    try{
        // let AllTaskList = await taskListsData.getAll();

        let AllTaskList = await taskListsData.getAllForAUser(req.session.user._id);

        let filtered = [];
        for (let x  of AllTaskList){
            let temp = await taskListsData.get(x);
            if(temp.isDeleted === false){
                filtered.push(temp);
            }
        }

        // res.status(200).json(AllTaskList);
        res.status(200).render('tasklists/taskBoard', {pageTitle: "Task Board", taskLists: filtered});
    }
    catch(e){
        res.status(500).json({error: e});
    }
});


router.get('/upcoming', async (req, res)=>{

    if(!req.session.user){
        // should just redirect to homepage.
        // res.status(400).json({error: 'user does not exists.'});
        res.redirect('/');
        return;
    }


    try{
        // let AllTaskList = await taskListsData.getAll();

        let AllTaskList = await taskListsData.getAllForAUser(req.session.user._id);

        let filtered = [];
        for (let x  of AllTaskList){
            let temp = await taskListsData.get(x);
            if(temp.isDeleted === false){
                filtered.push(temp);
            }
        }

        let AllFirstTasks = [];
        let AllDeadlines = [];
        for (let y of filtered){
            if(y.tasks.length > 0){

                let task = await taskData.get(y.tasks[0]);
                AllFirstTasks.push(task.name);
                AllDeadlines.push(task.deadlineDate);
            }
            else{
                AllFirstTasks.push("N/A");
                AllDeadlines.push("N/A")
            }
            
            
        }

        let result = [];

        for (let i = 0; i < filtered.length; i ++){
            let temp = {
                listName: filtered[i].listName,
                deadline: AllDeadlines[i],
                firstTask: AllFirstTasks[i]
            }

            result.push(temp);
        }

        res.status(200).render('tasklists/upcoming', {pageTitle: "Upcoming tasks", firstTasks: result});
    }
    catch(e){
        res.status(500).json({error: e});
    }
});

router.get('/:id', async (req, res) =>{

    if(!req.session.user){
        res.redirect('/');
        return;
    }

    

    try{
        // let targetList = await taskListsData.get(req.params.id);
        // res.status(200).json(targetList);

        // should return all the tasks from this list.

        const id = validateTasklistId(xss(req.params.id));

    }
    catch(e){
        res.status(404).json({error: e});
    }
});

router.post('/', async (req,res) =>{
    let listInfo = req.body;

    if(!listInfo){
        res.status(400).json({error: 'you must provide data to create a task list.'});
        return;
    }

    if(!listInfo.listName){
        res.status(400).json({error: 'you must provide a list name'});
        return;
    }

    if(!req.session.user){
        // res.status(400).json({error: 'user does not exists.'});
        res.redirect('/');
        return;
    }

    try{
        const newList = await taskListsData.create(listInfo.listName, req.session.user._id);

        const addToUser = await userData.addTasklistToUser(req.session.user._id, newList._id)

        // res.status(200).json(newList);

        let AllTaskList = await taskListsData.getAllForAUser(req.session.user._id);

        let filtered = [];
        for (let x  of AllTaskList){
            let temp = await taskListsData.get(x);
            if(temp.isDeleted === false){
                filtered.push(temp);
            }
        }

        // res.status(200).json(AllTaskList);
        res.status(200).render('tasklists/taskBoard', {pageTitle: "Task Board", taskLists: filtered});
    }
    catch(e){
        res.status(400).json({error: e});
    }
});


router.put('/:id', async  (req,res)=>{

    if(!req.params.id){
        throw "you must provide an id.";
    } 

    let listInfo = req.body;

    if(! listInfo){
        res.status(400).json({error: 'you must provide data to update a task list.'});
        return;
    }

    if(! listInfo.listName){
        res.status(400).json({error: 'you must provide a list name'});
        return;
    }

    if(!listInfo.tasks){
        res.status(400).json({error: 'you must provide tasks for the list.'});
        return;
    }

    //maybe some extra error checking for isDeleted and deletionDate, 
    // but we want to make sure users can only update these two fields with the "delete" method

    try{
        let targetList = await taskListsData.get(req.params.id);
        let isDeleted = targetList.isDeleted;

        if(isDeleted === true){
            res.status(404).json({error: 'this list has been deleted.'});
            return;
        }
    }
    catch(e){
        res.status(400).json({error: e});
    }

    // now isDeleted must be false

    try{
        const updatedList = await taskListsData.update(
            req.params.id,
            listInfo.listName,
            listInfo.tasks,
            false,
            ''
        )

        res.status(200).json(updatedList);
    }
    catch(e){
        res.status(400).json({error: e});
    }
});

router.delete('/:id', async (req,res) => {
   try{
        await taskListsData.get(req.params.id);
   }
   catch(e){
       res.status(404).json({error: e});
       return;
   }

   try{
       const deletedInfo = await taskListsData.remove(req.params.id);
       res.status(200).json(deletedInfo);
   }
   catch(e){
       res.status(400).json({error: e});
   }
});





module.exports = router;