const addForm = document.querySelector("form.add-task"),
      addInput = document.querySelector(".new-task"),
      message = document.querySelector(".message"),
      uncheckedCont = document.querySelector('.unchecked-container'),
      checkedCont = document.querySelector('.checked-container'),
      checkButton = document.querySelector('.tasks'),
      deleteAll = document.querySelector('.delete-button');

const shareBtn = document.querySelector('.share-btn-url'),
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
shareBtn.addEventListener('click', shareURL);
addForm.addEventListener("submit", addTodo);
checkButton.addEventListener('click', deleteOrMarkCheck);
checkButton.addEventListener('click', editIncomplicateTask);
deleteAll.addEventListener('click', deleteAllTasks);

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
        checkedCont.prepend(el);
        complNum++;
    } else {
        uncheckedCont.append(el);
    }
    updateURLFromLocalStorage();
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
    if (item && item.tagName == 'A') {
        if(newItem.classList.contains('checked')) {
            newItem.classList.remove('checked');
            newItem.childNodes[3].classList.remove('checked');
            uncheckedCont.append(newItem);
        } else {
            newItem.classList.toggle('checked');
            newItem.childNodes[3].setAttribute("contenteditable", false);
            newItem.childNodes[3].classList.add('checked');
            checkedCont.prepend(newItem);
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
                <span>"${item.children[1].innerText}"</span>
                ?
            </div>
            <div class="buttons">
                <button class="modal-btn">Yes</button>
                <button class="modal-btn">No</button></div>
        </div>
    `;

    const span = modal.childNodes[1].childNodes[1].childNodes[1];
    if (item.classList.contains('checked')) {
        span.classList.add('checked');
    } else {
        span.classList.remove('checked');
    }

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

function deleteAllTasks(e) {
    e.preventDefault();
    uncheckedCont.innerHTML = '';
    checkedCont.innerHTML = '';
    window.location.search = '';
    localStorage.clear();
    checkCompleteSummary();
}

// Social icons share
function socialIonsShare() {
    let postUrl = encodeURI(document.location.href);
    let postTitle = encodeURI(`Hello! This is my first project on JavaScript: `);

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

function shareURL(e) {
    const item = e.target.parentElement;
    const modal = document.createElement("div");

    modal.classList.add("delete-modal-overlay");
    modal.innerHTML = `
        <div class="delete-modal">
            <input class="url-link" value="${window.location.href}"></input>
            <button class="modal-btn">Copy link</button>
        </div>
    `;

    document.querySelector('.tasks h2').after(modal);
    document.body.style.overflow = 'hidden';
    
    console.dir(item.childNodes[4]);
    document.querySelector('.modal-btn').addEventListener('click', (e) => {
        const copyLink = document.querySelector('.url-link');
        copyLink.select();
        document.execCommand("copy");
        item.childNodes[4].remove();
        document.body.style.overflow = '';
    });
}

// localStorage
function passDataInLocalStorFromURL() {
    if (window.location.search) {
        const dataUrl = decodeURIComponent(window.location.search).slice(3, -1).replace(/\s/g, '#');
        dataUrl.split('{').map(item => {
            const oldArr = item.replace(/[\"\}]/g, '').replace(/[\,\:]/g, ' ').replace(/(id)/i, '');
            const newArr = oldArr.replace(/(todo)/i, '').replace(/(checked)/i, '').replace(/(edited)/i, '').split(' ');

            let obj = {};
            obj.id = newArr[1];
            obj.todo = newArr[3].replace(/#/g, ' ');
            if (newArr[5] === 'true') {
                obj.checked = true;
            } else {
                obj.checked = false;
            }
            if (newArr[7] === 'true') {
                obj.edited = true;
            } else {
                obj.edited = false;
            }
                       
            let i = todoListArr.length;
            todoListArr[i] = obj;
        });
        
        localStorage.setItem('todos', JSON.stringify(todoListArr));
    }
}

function getDataOnReboot() {
    passDataInLocalStorFromURL();

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

    const summary = document.querySelector(".summary");
    if (complNum == 0 && incomplNum == 0 && summary) {
        summary.remove();
    }

    if (todoListArr !== undefined) {
        todoListArr.forEach((item) => {
            if (item.checked == true) {
                createTask(item, item.checked);
            } else {
                createTask(item);
            }
        });
    }

    addSummaryClassList();
    socialIonsShare();
}

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
    updateURLFromLocalStorage();
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

    todoListArr.forEach(item => {
        if (item.id == taskId) {
            item.checked = !item.checked;
        }
    });

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

function updateURLFromLocalStorage() {
    const searchCode = encodeURIComponent(localStorage.todos);

    if (history.pushState) {
        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        const newUrl = `${baseUrl}?${searchCode}`;
        history.pushState(null, null, newUrl);
    }
}

console.log(window.location.href);