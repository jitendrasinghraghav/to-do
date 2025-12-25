const { app, db } = require('rohit-node-app');

require('dotenv').config();
const PORT = process.env.PORT


//SSR - server side rendering
// app.get('/',async function(req,res){

// let tasks = await db.promise().query('SELECT * FROM `task`');

//     let result = {
//         data: tasks[0],
//         type: 'success',
//         message: 'tasks get successfully',

//     }
//     res.render('index',{result});

// });



//CSR - client side rendering
app.get('/', function (req, res) {
    res.render('index-csr');
});

app.get('/get-tasks', async function (req, res) {

    let tasks = await db.promise().query('SELECT * FROM `task`');

    let result = {
        data: tasks[0],
        type: 'success',
        table: '#tasks-table tbody',
        message: 'tasks get successfully',

    }

    res.send(result);
})



app.post('/create-task', async function (req, res) {
    let { task, dueDate } = req.body;

console.log(dueDate)

    // validations
    let finalResult;
    let err = [];

    if (!task) {
        err.push('Task is required');
    }
    if (!dueDate) {
        err.push('Due Date is required');
    }

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let selectedDate = new Date(dueDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        err.push('Due Date is invalid');
    }


    if (err.length) {
        finalResult = {
            type: 'error',
            test: err.length,
            swal: {
                icon: 'error',
                title: 'Oops!',
                html: err.join('<br/>'),
                keydownListenerCapture: true,
                timer: 1000, // 👈 2 seconds (2000ms) me alert auto close hoga
                buttons: false // 👈 agar buttons nahi chahiye
            }
        }
    } else {

        const [rows] = await db.promise().query('SELECT MAX(serial) AS max_no FROM task');
        const serial = (parseInt(rows[0].max_no) || 0) + 1;
        let status = "Pending"
        let today = new Date();
        let priority = "Low"
// console.log(today)
        // new task insert karo
        let userTask = await db.promise().query('INSERT INTO task (serial, task, adddate, dueDate, status, priority) VALUES (?, ?, ?, ?, ?, ?)', [serial, task, today, dueDate, status, priority]);


        finalResult = {
            data: {
                task,
                dueDate,
                id: userTask[0].insertId
            },
            type: 'success',
            message: 'task created',
            swal: {
                icon: 'success',
                title: 'Success',
                html: 'Task created',
                keydownListenerCapture: true,
                timer: 1000, // 👈 2 seconds (2000ms) me alert auto close hoga
                buttons: false // 👈 agar buttons nahi chahiye
            }
        }
    }

    res.send(finalResult);
});


app.get('/delete-task/:id', async function (req, res) {
    let id = req.params.id;

    let task = await db.promise().query('DELETE FROM `task` WHERE id = ?', [id]);


    //  await db.promise().query('SET @count = 0');
    // await db.promise().query('UPDATE task SET serial = (@count := @count + 1) ORDER BY id');


    // Saare tasks fetch karo (sorted)
    const [rows] = await db.promise().query('SELECT id FROM task ORDER BY id');

    // Serial reset manually
    let count = 1;
    for (const row of rows) {
        await db.promise().query('UPDATE task SET serial = ? WHERE id = ?', [count, row.id]);
        count++;
    }


    finalResult = {
        deleteRow: true,
        type: 'success',
        swal: {
            icon: 'success',
            title: 'Success',
            html: 'Task deleted',
            keydownListenerCapture: true,
            timer: 800, // 👈 2 seconds (2000ms) me alert auto close hoga
            buttons: false // 👈 agar buttons nahi chahiye
        }
    }
    res.send(finalResult);
})


app.post('/statusUpdate/:id', async function (req, res) {
    let id = req.params.id;

    let { status } = req.body;

    let updateStatus = await db.promise().query('UPDATE task SET status = ? WHERE `id` = ?', [status, id]);
    res.send(updateStatus);

})

app.post('/prioritystatus/:id', async function (req, res) {
   let id = req.params.id;
   let { priorityStatus } = req.body;

    let updateStatus = await db.promise().query('UPDATE task SET priority = ? WHERE `id` = ?', [priorityStatus, id]);

   res.send(updateStatus);    
})

app.get('/status/filter/:value', async function (req, res) {
    let taskStatus = req.params.value;
    // console.log(req.params.value);

    if (taskStatus == "all") {
        let result = {
            taskStatus,
            type: 'success',
            table: '#tasks-table tbody',
            message: 'tasks get successfully',

        }
        res.send(result);
    }
    else {
        let tasks = await db.promise().query('SELECT * FROM `task` WHERE `status` = ?', [taskStatus]);

        let result = {
            data: tasks[0],
            taskStatus,
            type: 'success',
            table: '#tasks-table tbody',
            message: 'tasks get successfully',
        }
        res.send(result);
    }

});


app.get('/day/status/filter/:value', async function (req, res) {
    let dayFilter = req.params.value;   // today | week | month

    if (dayFilter === 'today') {
        let tasks = await db.promise().query('SELECT * FROM `task` WHERE DATE(duedate) = CURDATE()');
        let result = {
            data: tasks[0],
            dayFilter,
            type: 'success',
            table: '#tasks-table tbody',
            message: 'tasks get successfully',
        }
        res.send(result);

    }
    else if (dayFilter === 'week') {
        let tasks = await db.promise().query('SELECT * FROM `task` WHERE YEARWEEK(duedate, 1) = YEARWEEK(CURDATE(), 1)');
        let result = {
            data: tasks[0],
            dayFilter,
            type: 'success',
            table: '#tasks-table tbody',
            message: 'tasks get successfully',
        }
        res.send(result);
    }

    else if (dayFilter === 'month') {
        let tasks = await db.promise().query('SELECT * FROM `task` WHERE MONTH(duedate) = MONTH(CURDATE()) AND YEAR(duedate) = YEAR(CURDATE())');
        let result = {
            data: tasks[0],
            dayFilter,
            type: 'success',
            table: '#tasks-table tbody',
            message: 'tasks get successfully',
        }
        res.send(result);
    }
});


app.get('/priority/status/filter/:value',async function(req,res){
    let priorityFilter = req.params.value; 

     let tasks = await db.promise().query('SELECT * FROM `task` WHERE `priority` = ?', [priorityFilter]);

        let result = {
            data: tasks[0],
            priorityFilter,
            type: 'success',
            table: '#tasks-table tbody',
            message: 'tasks get successfully',
        }
        res.send(result);
})


app.get('/task/:id', async function (req, res) {
    let { id } = req.params;

    let task = await db.promise().query('SELECT * FROM `task` WHERE `id` = ?', [id]);

    let result = {
        type: 'success',
        form_fields: task[0][0],
        modal_show: '#task-modal',
        update_url: `/update_task/${id}`
    };
    res.send(result);
})

app.post('/update_task/:id', async function (req, res) {
    let { id } = req.params;

    let { task } = req.body;


    // validations
    let finalResult;
    let err = [];

    if (!task) {
        err.push('Task is required');
    } else {
        let exist = await db.promise().query("SELECT `task` FROM `task` WHERE `task` = ?", [task]);
        if (exist[0][0]) {
            err.push('Did not change');
        }
    }

    if (err.length) {
        finalResult = {
            type: 'error',
            test: err.length,
            swal: {
                icon: 'error',
                title: 'Oops!',
                html: err.join('<br/>'),
                keydownListenerCapture: true,
                timer: 2000, // 👈 2 seconds (2000ms) me alert auto close hoga
                buttons: false // 👈 agar buttons nahi chahiye
            }
        }
    } else {
        await db.promise().query('UPDATE task SET task = ? WHERE `id` = ?', [task, id]);

        finalResult = {
            // data: {
            //     task,
            //     id: userTask[0].insertId
            // },

            type: 'success',
            message: 'task created',
            modal_hide: '#task-modal',
            swal: {
                icon: 'success',
                title: 'Success',
                html: 'Task created',
                keydownListenerCapture: true,
                timer: 2000, // 👈 2 seconds (2000ms) me alert auto close hoga
                buttons: false // 👈 agar buttons nahi chahiye
            }
        }
    }
    res.send(finalResult);
});



app.listen(PORT, function () {
    console.log("http://localhost:" + PORT);
});