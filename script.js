const addForm = document.querySelector("form.add-task"),
      addInput = document.querySelector(".new-task"),
      message = document.querySelector(".message"),
      checkButton = document.querySelector('.tasks');

let todoListArr = [],
    incomplNum = 0,
    complNum = 0,
    complPercent = 0;

document.addEventListener('DOMContentLoaded', getDataOnReboot);
addForm.addEventListener("submit", addTodo);
checkButton.addEventListener('click', deleteOrMarkCheck);

function addTodo(event) {
    event.preventDefault();

    let newTask = addInput.value,
    obj = {};
    obj.id = new Date().getTime();
    obj.todo = newTask;
    obj.checked = false;
    obj.editing = false;

    let i = todoListArr.length;
    todoListArr[i] = obj;
    
    if(newTask) {
        createTask(obj);
        saveTodosInLocalStorage(obj);
    }
}

function createTask(task, checkTrue) {
    const el = document.createElement("div");

    el.classList.add("task");
    el.setAttribute("id", task.id);
    el.innerHTML = `
        <a></a>
        <span>${task.todo}</span>
        <button class="close-image"><img src="https://icons-for-free.com/iconfiles/png/512/delete+remove+trash+trash+bin+trash+can+icon-1320073117929397588.png"></button>
    `;
    message.innerHTML = "";
    addInput.value = '';

    if (checkTrue) {
        el.classList.add("checked");
        document.querySelector(".summary").after(el);
        complNum++;
    } else {
        addForm.before(el);
    }
    checkCompleteSummary();
}

function checkCompleteSummary() {
    incomplNum = todoListArr.length;
    complNum = +complNumLocalStorage();
    complPercent = parseInt((100 * complNum) / incomplNum).toFixed(0);

    if (incomplNum || complNum) {
        const summary = document.querySelector(".summary");
        const num = summary ? summary : document.createElement("div");
        num.innerHTML = `
            <div class="hr"></div>
            <div class="status">
                <span class="complete">${complNum}</span>
                /
                <span class="incomplete">${incomplNum}</span>
                (
                <span class="percentage">${complPercent}%</span>
                done)
            </div>
        `;
        num.classList.add("summary");
        addForm.after(num);
    } else if (complNum == 0 && incomplNum == 0) {
        message.innerHTML = '<div>You don\'t have tasks to do.</div>';
        if (document.querySelector(".summary")) {
            document.querySelector(".summary").remove();
        }
    }
    addSummaryClassList();
}

function addSummaryClassList() {
    const percent = document.querySelector(".percentage");
    
    if (complPercent > 0 && complPercent < 50) {
        message.innerHTML = "";
        percent.classList.add("red");
    } else if (complPercent >= 50 && complPercent <= 99) {
        message.innerHTML = "";
        percent.classList.add("orange");
    } else if (complPercent == 100) {
        message.innerHTML = "";
        percent.classList.add("green");
        message.innerHTML = `
            <div>🎊</div>
            <div>All done!</div>
        `;
    } 
}

function deleteOrMarkCheck(e) {
    const item = e.target;
    const newItem = item.parentElement;

    // Check task
    if (item.tagName == 'A') {
        if(newItem.classList.contains('checked')) {
            newItem.classList.remove('checked');
            addForm.before(newItem);
        } else {
            newItem.classList.toggle('checked');
            document.querySelector(".summary").after(newItem);
        }
        checkedTaskInLocalStorage(newItem.id);
    // Delete task
    } else if (item.matches('button.close-image')) {
        createModalWindow(e);
        checkDeleteModalButtons(e);
    }
    checkCompleteSummary();
}

function createModalWindow(e) {
    const item = e.target.parentElement;
    const modal = document.createElement("div");
    
    modal.classList.add("delete-modal-overlay");
    modal.innerHTML = `
        <div class="delete-modal">
            <div>Are you sure you want to delete task
                <span>"${item.children[1].innerText}"?</span>
            </div>
            <div class="buttons">
                <button class="modal-btn">Yes</button>
                <button class="modal-btn">No</button></div>
        </div>
    `;
    document.querySelector('.tasks h2').after(modal);
}

function checkDeleteModalButtons(eventTask) {
    const btnMod = document.querySelector(".delete-modal");
        
    btnMod.addEventListener('click', (eventBtn) => {
        const eventModal = eventBtn.target.parentElement.parentElement.parentElement;
        const todoTask = eventTask.target.parentElement;

        if (eventBtn.target.innerHTML === 'No') {
            eventModal.remove();
        } else if (eventBtn.target.innerHTML === 'Yes') {
            eventModal.remove();
            todoTask.remove();
            removeTodosFromLocalStorage(todoTask.id);
            checkCompleteSummary();
        }
    });
}

// localStorage
function saveTodosInLocalStorage(todoArr) {
    checkArrayLocalStorage();
    todoListArr.push(todoArr);
    pushDatasInLocalStorage();
}

function removeTodosFromLocalStorage(taskId) {
    checkArrayLocalStorage();
    const removeIndex = todoListArr.findIndex(item => {return item.id == taskId;});
    todoListArr.splice(removeIndex, 1);
    pushDatasInLocalStorage();
}

function checkArrayLocalStorage() {
    if(localStorage.getItem('todos') === null) {
        todoListArr = [];
    } else {
        todoListArr = JSON.parse(localStorage.getItem('todos'));
    }
}

function pushDatasInLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todoListArr));
}

function complNumLocalStorage() {
    checkArrayLocalStorage();

    let num = 0;
    todoListArr.forEach(item => {
        if (item.checked == true) {
            num++;
        }
    });
    return num;
}

function checkedTaskInLocalStorage(taskId) {
    checkArrayLocalStorage();
    const removeIndex = todoListArr.findIndex(item => {return item.id == taskId;});

    todoListArr[removeIndex].checked = !todoListArr[removeIndex].checked;
    todoListArr.sort((a, b) => {return a.checked - b.checked;});
    pushDatasInLocalStorage();
}

function getDataOnReboot(e) {
    if(localStorage.getItem('todos') === null) {
        todoListArr = [];
    } else {
        todoListArr = JSON.parse(localStorage.getItem('todos'));

        const num = document.createElement("div");
        num.innerHTML = `
            <div class="hr"></div>
            <div class="status">
                <span class="complete">${complNum}</span>
                /
                <span class="incomplete">${incomplNum}</span>
                (
                <span class="percentage">${complPercent}%</span>
                done)
            </div>
        `;
        num.classList.add("summary");
        addForm.after(num);
    }

    if (complNum == 0 && incomplNum == 0 && document.querySelector(".summary")) {
        document.querySelector(".summary").remove();
    }

    todoListArr.forEach((item) => {
        if (item.checked == true) {
            createTask(item, item.checked);
        } else {
            createTask(item);
        }
    });
    addSummaryClassList();
}