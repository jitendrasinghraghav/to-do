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



    // validations
    let finalResult;
    let err = [];

    if (!task) {
        err.push('Task is required');
    }
    if(!dueDate){
        err.push('Due Date is required');
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

        // new task insert karo
        let userTask = await db.promise().query('INSERT INTO task (serial, task, dueDate, status) VALUES (?, ?, ?, ?)', [serial, task,dueDate, status]);


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


app.post('/status/:id', async function (req, res) {
    let id = req.params.id;
     
    let {status} = req.body;    
    
    let updateStatus = await db.promise().query('UPDATE task SET status = ? WHERE `id` = ?', [status, id]);
    res.send(updateStatus);
    
})

app.get('/status/filter/:value', async function (req, res) {
    let taskStatus = req.params.value;
    // console.log(req.params.value);

    if(taskStatus == "all"){
        let result = {
        taskStatus,
        type: 'success',
        table: '#tasks-table tbody',
        message: 'tasks get successfully',

    }
    res.send(result);
    }
    else{
        let tasks = await db.promise().query('SELECT * FROM `task` WHERE `status` = ?',[taskStatus]);
        
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