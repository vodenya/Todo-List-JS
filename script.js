const addForm = document.querySelector("form.add-task"),
      addInput = document.querySelector(".new-task"),
      message = document.querySelector(".message"),
      checkButton = document.querySelector('.tasks');

const shareBtn = document.querySelector('.share-btn'),
      telegramBtn = document.querySelector('.telegram-btn'),
      facebookBtn = document.querySelector('.facebook-btn'),
      linkedinBtn = document.querySelector('.linkedin-btn'),
      whatsappBtn = document.querySelector('.whatsapp-btn'),
      twitterBtn = document.querySelector('.twitter-btn');

let todoListArr = [],
    incomplNum = 0,
    complNum = 0,
    complPercent = 0;

document.addEventListener('DOMContentLoaded', getDataOnReboot);
addForm.addEventListener("submit", addTodo);
checkButton.addEventListener('click', deleteOrMarkCheck);
checkButton.addEventListener('click', editIncomplicateTask);

function addTodo(e) {
    e.preventDefault();
    let newTask = addInput.value,
    obj = {};

    if(newTask) {
    obj.id = new Date().getTime();
    obj.todo = newTask;
    obj.checked = false;
    obj.edited = false;

    let i = todoListArr.length;
    todoListArr[i] = obj;
    
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
    el.childNodes[3].setAttribute("contenteditable", false);
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
            newItem.childNodes[3].setAttribute("contenteditable", false);
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
    document.body.style.overflow = 'hidden';
}

function checkDeleteModalButtons(eventTask) {
    const btnMod = document.querySelector(".delete-modal");
        
    btnMod.addEventListener('click', (eventBtn) => {
        const eventModal = eventBtn.target.parentElement.parentElement.parentElement;
        const todoTask = eventTask.target.parentElement;

        if (eventBtn.target.innerHTML === 'No') {
            eventModal.remove();
            document.body.style.overflow = '';
        } else if (eventBtn.target.innerHTML === 'Yes') {
            eventModal.remove();
            todoTask.remove();
            document.body.style.overflow = '';
            removeTodosFromLocalStorage(todoTask.id);
            checkCompleteSummary();
        }
    });
}

function editIncomplicateTask(e) {
    const item = e.target.parentElement;
    let newTodo;
    
    if (item && item.childNodes[3] && item.childNodes[3].tagName == 'SPAN' && !item.classList.contains('checked')) {
        item.childNodes[3].setAttribute("contenteditable", true);
        
        item.addEventListener('focusout', () => {
            newTodo = item.childNodes[3].textContent;
            editedTaskInLocalStorage(item.id, newTodo);
        });
    }

}

// Social icons share
function socialIonsShare() {
    let postUrl = encodeURI(document.location.href);
    let postTitle = encodeURI(`Hello! This is my first project on JavaScript: `);

    shareBtn.addEventListener('click', () => {

    });
    telegramBtn.setAttribute(
        "href", 
        `https://t.me/share/url?url=${postUrl}&title=${postTitle}`
    );
    facebookBtn.setAttribute(
        "href", 
        `https://www.facebook.com/sharer.php?u=${postUrl}`
    );
    linkedinBtn.setAttribute(
        "href", 
        `https://www.linkedin.com/shareArticle?url=${postUrl}&title=${postTitle}`
    );
    whatsappBtn.setAttribute(
        "href", 
        `https://api.whatsapp.com/send?text=${postTitle} ${postUrl}`
    );
    twitterBtn.setAttribute(
        "href", 
        `https://twitter.com/share?url=${postUrl}&text=${postTitle}`
    );
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
    const checkIndex = todoListArr.findIndex(item => {return item.id == taskId;});

    todoListArr[checkIndex].checked = !todoListArr[checkIndex].checked;
    todoListArr.sort((a, b) => {return a.checked - b.checked;});
    pushDatasInLocalStorage();
}

function editedTaskInLocalStorage(taskId, newTodo) {
    checkArrayLocalStorage();

    todoListArr.forEach((item, index) => {
        if (item.id != taskId) {
            return;
        }
        todoListArr[index].todo = newTodo;
        todoListArr[index].edited = true;
    });
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
    socialIonsShare();
}