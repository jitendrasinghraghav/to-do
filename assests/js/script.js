// for create
$(document).on('submit', '.form-submit', function (e) {
    e.preventDefault();

    let form = $(this);
    let data = new FormData($(this)[0]);
    // console.log(data)
    let type = $(this).attr('method');
    let url = $(this).attr('action');
    tinymce.triggerSave();


    $.ajax({
        url,
        data,
        type,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function (res) {
            // console.log(res);
            getResults('/get-tasks');
            tinymce.get('tiny').setContent('');
            $('#dueDateInput').val('');

            res.swal && Swal.fire(res.swal);
        },
        error: function () {
            console.log('error...');
        }
    });
});

// for read
function getResults(url) {
    $.ajax({
        url,
        dataType: 'json',
        success: function (res) {
            switch (res.table) {
                case "#tasks-table tbody":
                    taskTableData('#tasks-table', res.data);
                    break;
                case "#users-table":

                    break;
            }
            // console.log(res);
        },
        error: function () {
            console.log('ajax error in get');
        }
    });
}
// getResults('/get-tasks');

function taskTableData(tableId, data) {
    let rows = data.map(function (e) {
        return (`<tr class="status-${e.status} priority-${e.Priority?.toLowerCase()}">              
                                <td>${e.serial}</td>
                                <td>${e.task}</td>
                                <td>${e.AddDate.split('T')[0]}</td>
                                <td>${e.dueDate.split('T')[0]}</td>
                                <td class="status-col">
                                <div>${e.status}</div>
                                <div>
                                   <button class="btn btn-primary btn-sm border-0" type="button" data-bs-toggle="dropdown">
                                   &#8801;
                                   </button>
                                   <ul class="dropdown-menu">
                                   <li><a class="dropdown-item status" data-url="/statusUpdate/${e.id}"  data-status="Working">Working</a></li>
                                   <li><a class="dropdown-item status" data-url="/statusUpdate/${e.id}"  data-status="Pause">Pause</a></li>
                                   <li><a class="dropdown-item status" data-url="/statusUpdate/${e.id}"  data-status="Testing">Testing</a></li>
                                   <li><a class="dropdown-item status" data-url="/statusUpdate/${e.id}"  data-status="Done">Done</a></li>
                                   </ul>
                                </div> 
                                </td>

                                <td class="priority-col">

                                <div class="priority">
                                <label class="priority-item">
                                <input type="radio" class="priorityInput" data-url="/prioritystatus/${e.id}" data-status="High" name="priority_${e.id}" value="high"  ${e.Priority?.toLowerCase() === 'high' ? 'checked' : ''}>
                                <span>High</span>
                                </label>
                                
                                <label class="priority-item">
                                <input type="radio" class="priorityInput" data-url="/prioritystatus/${e.id}" data-status="Medium" name="priority_${e.id}" value="medium"  ${e.Priority?.toLowerCase() === 'medium' ? 'checked' : ''}>
                                <span>Med</span>
                                </label>
                                
                                <label class="priority-item">
                                  <input type="radio" class="priorityInput" data-url="/prioritystatus/${e.id}" data-status="Low" name="priority_${e.id}" value="low"  ${e.Priority?.toLowerCase() === 'low' ? 'checked' : ''}>
                                    <span>Low</span>
                                 </label>
                                    </div>
                                    <div class="priority-bar">
                                      <span>${e.Priority}</span>
                                     </div>
                                  </td>

                                  

                                </td>

                                <td>
                                    <button class="btn btn-info btn-sm row-edit " data-url="/task/${e.id}" ><i class="fa fa-pencil"
                                            aria-hidden="true"></i></button>
                                    <button class="btn btn-danger btn-sm row-delete" data-url="/delete-task/${e.id}"><i class="fa fa-trash"
                                            aria-hidden="true"></i></button>
                                </td>
                            </tr>`
        );
    });
    $(tableId + ' tbody').html(rows.join(''));
}

//for delete
$(document).on('click', '.row-delete', function () {

    let row = $(this).parents('tr');
    let url = $(this).data('url');
    // console.log(url);

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url,
                dataType: 'json',
                success: function (res) {
                    console.log(res);

                    res.deleteRow && row.remove();

                    getResults('/get-tasks');

                    res.swal && swal.fire(res.swal);
                },
                error: function () {
                    console.log('Ajax error in delete')
                }
            })
        }
    });
});


// for edit button
$(document).on('click', '.row-edit', function () {

    let url = $(this).data('url');

    $.ajax({
        url,
        dataType: 'json',
        success: function (res) {
            console.log(res);

            res.modal_show && $(res.modal_show).modal('show');

            res.update_url && $(res.modal_show).find('form').attr('action', res.update_url);

            // if (res.form_fields) {
            //     for (key in res.form_fields) {
            //         $(`[name=${key}]`).val(res.form_fields[key]);
            //     }
            // }

            if (res.form_fields) {
                for (key in res.form_fields) {
                    $(res.modal_show).find(`[name=${key}]`).val(res.form_fields[key]);
                }
            }
        },
        error: function () {
            console.log("edit error..ajax")
        }
    });
});


// for update
$(document).on('submit', '.modal-form-submit', function (e) {
    e.preventDefault();

    let form = $(this);

    let data = new FormData($(this)[0]);

    let type = $(this).attr('method');

    let url = $(this).attr('action');

    $.ajax({
        url,
        data,
        type,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function (res) {
            console.log(res);

            getResults('/get-tasks');
            $("#taskInput").val("");

            res.swal && Swal.fire(res.swal);

            // $(res.modal_hide).modal('hide');
            res.modal_hide && $(res.modal_hide).modal('hide');
        },
        error: function () {
            console.log('error...');
        }
    });
});


// for Status Update
$(document).on('click', '.status', function () {

    let url = $(this).data('url');
    let status = $(this).data('status');
    // console.log(url, status);
    $.ajax({
        url,
        type: 'POST',
        data: { status },
        // status,  
        dataType: 'json',
        success: function (res) {
            // console.log(res);
            getResults('/get-tasks');
        },
        error: function () {
            console.log('Ajax error in status')
        }
    })
});

// for priority status
$(document).on('click', '.priorityInput', function () {
    let url = $(this).data('url');
    let priorityStatus = $(this).data('status');
    $.ajax({
        url,
        type: 'POST',
        data: { priorityStatus },
        // status,  
        dataType: 'json',
        success: function (res) {
            console.log(res);
            // getResults('/get-tasks');
        },
        error: function () {
            console.log('Ajax error in status')
        }
    })
});


// for filter status based on working status
$(document).on('click', '.statusBtn', function () {
    let url = $(this).data('url');

    $.ajax({
        url,
        success: function (res) {
            let taskStatus = res.taskStatus;
            console.log(res.taskStatus);
            if (taskStatus == "all") {
                getResults('/get-tasks');
            }
            else {
                getResults(url);
            }
        },
        error: function () {
            console.log('Ajax error in status')
        }
    })
});


//for day filter status  based on due date
$(document).on('click', '.dateStatusBtn', function () {
    let url = $(this).data('url');
    $.ajax({
        url,
        success: function (res) {
            console.log(res)
            getResults(url);
        },
        error: function () {
            console.log('Ajax error in status')
        }
    })
})


//for Priority filter status  based on priority
$(document).on('click', '.priorityStatusBtn', function () {
    let url = $(this).data('url');
    $.ajax({
        url,
        success: function (res) {
            // console.log(res)
            getResults(url);
        },
        error: function () {
            console.log('Ajax error in status')
        }
    })
});

// for dark theme
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

body.setAttribute("data-bs-theme", "light");
body.classList.add("bg-light");

toggleBtn.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    body.setAttribute("data-bs-theme", newTheme);

    if (newTheme === "dark") {
        body.classList.remove("bg-light");
        body.classList.add("bg-dark", "text-white");
        toggleBtn.textContent = "☀️";
        toggleBtn.classList.remove("btn-outline-secondary");
        toggleBtn.classList.add("btn-outline-light");
    } else {
        body.classList.remove("bg-dark", "text-white");
        body.classList.add("bg-light");
        toggleBtn.textContent = "🌙";
        toggleBtn.classList.remove("btn-outline-light");
        toggleBtn.classList.add("btn-outline-secondary");
    }
});


// for priority bar
$(document).on('change', '.priorityInput', function () {
    let tr = $(this).closest('tr');

    tr.removeClass('priority-high priority-medium priority-low');
    tr.addClass('priority-' + this.value);
});
