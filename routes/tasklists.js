const express = require('express');
const router = express.Router();
const data = require('../data');
const taskListsData = data.tasklists;
const taskData = data.tasks;

router.get('/', async (req,res) =>{
    try{
        let AllTaskList = await taskListsData.getAll();

        let filtered = [];
        for (let x  of AllTaskList){
            if(x.isDeleted === false){
                filtered.push(x);
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
    try{
        let AllTaskList = await taskListsData.getAll();

        let filtered = [];
        for (let x  of AllTaskList){
            if(x.isDeleted === false){
                filtered.push(x);
            }
        }

        let AllFirstTasks = [];
        for (let y of filtered){
            if(y.tasks.length > 0){

                let task = await taskData.get(y.tasks[0]);
                AllFirstTasks.push(task.name);
            }
            else{
                AllFirstTasks.push("N/A");
            }
            
            
        }

        res.status(200).render('tasklists/upcoming', {pageTitle: "Upcoming tasks", firstTasks: AllFirstTasks});
    }
    catch(e){
        res.status(500).json({error: e});
    }
});

router.get('/:id', async (req, res) =>{

    try{
        let targetList = await taskListsData.get(req.params.id);
        res.status(200).json(targetList);
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

    try{
        const newList = await taskListsData.create(listInfo.listName);

        

        // res.status(200).json(newList);

        let AllTaskList = await taskListsData.getAll();

        let filtered = [];
        for (let x  of AllTaskList){
            if(x.isDeleted === false){
                filtered.push(x);
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
        res.status(400).json({error: 'you must provide a lsit name'});
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