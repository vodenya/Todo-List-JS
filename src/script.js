const addForm = document.querySelector("form.add-task"),
  addInput = document.querySelector(".new-task"),
  message = document.querySelector(".message"),
  uncheckedCont = document.querySelector(".unchecked-container"),
  checkedCont = document.querySelector(".checked-container"),
  containers = document.querySelectorAll("[data-container]"),
  checkButton = document.querySelector(".tasks"),
  deleteAll = document.querySelector(".delete-button");

const shareBtn = document.querySelector(".share-btn-url"),
  telegramBtn = document.querySelector(".telegram-btn"),
  facebookBtn = document.querySelector(".facebook-btn"),
  linkedinBtn = document.querySelector(".linkedin-btn"),
  whatsappBtn = document.querySelector(".whatsapp-btn"),
  twitterBtn = document.querySelector(".twitter-btn");

let todoListArr = [],
  incomplNum = 0,
  complNum = 0,
  complPercent = 0;

document.addEventListener("DOMContentLoaded", getDataOnPageReload);
shareBtn.addEventListener("click", shareURL);
addForm.addEventListener("submit", addTodo);
checkButton.addEventListener("click", markDeleteDraggingCheck);
checkButton.addEventListener("click", editIncomplicateTask);
deleteAll.addEventListener("click", deleteAllTasks);

// ===== Creating tasks and changing status

function addTodo(e) {
  e.preventDefault();

  if (addInput.value) {
    let obj = {};
    obj.id = new Date().getTime();
    obj.todo = addInput.value;
    obj.checked = false;
    obj.edited = false;

    let i = todoListArr.length;
    todoListArr[i] = obj;

    createTask(obj);
    saveTodosInLocalStorage(obj);
    updateURLFromLocalStorage();
    draggablesEvents();
  }
}

function createTask(obj, checkTrue) {
  const el = document.createElement("div");

  el.classList.add("task");
  el.setAttribute("id", obj.id);
  el.setAttribute("draggable", true);
  el.innerHTML = `
    <a></a>
    <span>${obj.todo}</span>
    <button class="close-image"><img src="https://icons-for-free.com/iconfiles/png/512/delete+remove+trash+trash+bin+trash+can+icon-1320073117929397588.png"></button>
    `;
  el.childNodes[3].setAttribute("contenteditable", false);
  message.innerHTML = "";
  addInput.value = "";

  if (checkTrue) {
    el.classList.add("checked");
    checkedCont.append(el);
  } else {
    uncheckedCont.append(el);
  }
  checkCompleteSummary();
}

// Block of the account of completed tasks
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
    message.innerHTML = "<div>You don't have tasks to do.</div>";
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

function markDeleteDraggingCheck(e) {
  const item = e.target;

  // Mark task
  if (item && item.tagName == "A") {
    changeStatusOfTasks(e);
    // Delete task
  } else if (item.matches("button.close-image")) {
    createModalWindow(e);
    checkDeleteModalButtons(e);
  } else if (item.matches("div.task")) {
    draggablesEvents();
  }
  checkCompleteSummary();
}

// Contenteditable of tasks
function editIncomplicateTask(e) {
  const item = e.target.parentElement;
  let newTodo;

  if (
    item &&
    item.childNodes[3] &&
    item.childNodes[3].tagName == "SPAN" &&
    !item.classList.contains("checked")
  ) {
    item.childNodes[3].setAttribute("contenteditable", true);

    item.addEventListener("focusout", () => {
      newTodo = item.childNodes[3].textContent;
      editedTaskInLocalStorage(item.id, newTodo);
    });
  }
}

// Checked/unchecked tasks
function changeStatusOfTasks(e) {
  const newItem = e.target.parentElement;
  if (newItem.classList.contains("checked")) {
    newItem.classList.remove("checked");
    newItem.childNodes[3].classList.remove("checked");
    uncheckedCont.append(newItem);
  } else {
    newItem.classList.toggle("checked");
    newItem.childNodes[3].setAttribute("contenteditable", false);
    newItem.childNodes[3].classList.add("checked");
    checkedCont.prepend(newItem);
  }
  checkCompleteSummary();
  checkedTaskInLocalStorage(newItem.id);
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
  if (item.classList.contains("checked")) {
    span.classList.add("checked");
  } else {
    span.classList.remove("checked");
  }

  document.querySelector(".tasks h2").after(modal);
  document.body.style.overflow = "hidden";
}

function checkDeleteModalButtons(eventTask) {
  const btnMod = document.querySelector(".delete-modal");

  btnMod.addEventListener("click", (eventBtn) => {
    const eventModal =
      eventBtn.target.parentElement.parentElement.parentElement;
    const todoTask = eventTask.target.parentElement;

    if (eventBtn.target.innerHTML === "No") {
      eventModal.remove();
      document.body.style.overflow = "";
    } else if (eventBtn.target.innerHTML === "Yes") {
      eventModal.remove();
      todoTask.remove();
      document.body.style.overflow = "";
      removeTodosFromLocalStorage(todoTask.id);
      checkCompleteSummary();
    }
  });
}

function deleteAllTasks(e) {
  e.preventDefault();
  const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  history.pushState(null, null, baseUrl);

  uncheckedCont.innerHTML = "";
  checkedCont.innerHTML = "";
  localStorage.clear();
  checkCompleteSummary();
}

// Social icons-buttons share
function socialIonsShare() {
  shortenLinkBitly().then((id) => {
    let postUrl = encodeURI(id);
    let postTitle = encodeURI(`Hello! Look at the todo list: `);

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
  });
}

function shareURL(e) {
  shortenLinkBitly().then((id) => {
    const item = e.target.parentElement;
    const modal = document.createElement("div");

    modal.classList.add("delete-modal-overlay");
    modal.innerHTML = `
        <div class="delete-modal">
          <input class="url-link" value="${id}"></input>
          <button class="modal-btn">Copy link</button>
        </div>
      `;
    document.querySelector(".tasks h2").after(modal);
    document.body.style.overflow = "hidden";

    document.querySelector(".modal-btn").addEventListener("click", (e) => {
      const copyLink = document.querySelector(".url-link");
      copyLink.select();
      document.execCommand("copy");
      item.childNodes[4].remove();
      document.body.style.overflow = "";
    });
  });
}

async function shortenLinkBitly() {
  const res = await fetch("https://api-ssl.bitly.com/v4/shorten", {
    method: "POST",
    headers: {
      Authorization: "Bearer 0116f9485f9469fe475c9cfc2e3f714469bdc138",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      long_url: window.location.href,
      domain: "bit.ly",
      group_guid: "Bl21i4gGSVh",
    }),
  });
  const { id } = await res.json();
  return id;
}

function updateURLFromLocalStorage() {
  const searchCode = encodeURIComponent(localStorage.todos);

  if (history.pushState) {
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const newUrl = `${baseUrl}?${searchCode}`;
    history.pushState(null, null, newUrl);
  }
}

// ===== localStorage
function passDataInLocalStorFromURL() {
  if (window.location.search.length > 15) {
    const dataUrl = decodeURIComponent(window.location.search)
      .slice(3, -1)
      .replace(/\s/g, "#");

    dataUrl.split("{").map((item) => {
      const oldArr = item
        .replace(/[\"\}]/g, "")
        .replace(/[\,\:]/g, " ")
        .replace(/(id)/i, "");
      const newArr = oldArr
        .replace(/(todo)/i, "")
        .replace(/(checked)/i, "")
        .replace(/(edited)/i, "")
        .split(" ");

      let obj = {};
      obj.id = +newArr[1];

      obj.todo = newArr[3].replace(/#/g, " ");
      if (newArr[5] === "true") {
        obj.checked = true;
      } else {
        obj.checked = false;
      }
      if (newArr[7] === "true") {
        obj.edited = true;
      } else {
        obj.edited = false;
      }

      let i = todoListArr.length;
      todoListArr[i] = obj;
    });

    localStorage.setItem("todos", JSON.stringify(todoListArr));
  } else {
    localStorage.clear();
  }
}

function getDataOnPageReload() {
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
  draggablesEvents();
}

function checkDataArrayInLocalStorage() {
  if (localStorage.getItem("todos") === null) {
    todoListArr = [];
  } else {
    todoListArr = JSON.parse(localStorage.getItem("todos"));
  }
}

function pushDataInLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todoListArr));
  updateURLFromLocalStorage();
}

function saveTodosInLocalStorage(todoObj) {
  checkDataArrayInLocalStorage();
  todoListArr.push(todoObj);
  pushDataInLocalStorage();
}

function removeTodosFromLocalStorage(taskId) {
  checkDataArrayInLocalStorage();
  const removeIndex = todoListArr.findIndex((item) => {
    return item.id == taskId;
  });
  todoListArr.splice(removeIndex, 1);
  pushDataInLocalStorage();
}

// Number of completed tasks for the summary
function complNumLocalStorage() {
  checkDataArrayInLocalStorage();
  let num = 0;
  todoListArr.forEach((item) => {
    if (item.checked == true) {
      num++;
    }
  });
  return num;
}

// Changing status of tasks and sorting the data array
function checkedTaskInLocalStorage(taskId) {
  checkDataArrayInLocalStorage();
  let checkedTask;

  todoListArr.forEach((item, index, arr) => {
    if (item.id == taskId) {
      item.checked = !item.checked;
      checkedTask = item;
      arr.splice(index, 1);
    }
  });

  let complArr = todoListArr.filter((item) => item.checked == true);
  let incomplArr = todoListArr.filter((item) => item.checked == false);

  if (checkedTask.checked == true) {
    let newComplArr = [checkedTask, ...complArr];
    todoListArr = [...incomplArr, ...newComplArr];
  } else {
    let newIncomplArr = [...incomplArr, checkedTask];
    todoListArr = [...newIncomplArr, ...complArr];
  }
  pushDataInLocalStorage();
}

function editedTaskInLocalStorage(taskId, newTodo) {
  checkDataArrayInLocalStorage();

  todoListArr.forEach((item, index) => {
    if (item.id != taskId) {
      return;
    }
    todoListArr[index].todo = newTodo;
    todoListArr[index].edited = true;
  });
  pushDataInLocalStorage();
}

// ===== Draggable

function draggablesEvents() {
  const draggables = document.querySelectorAll(".task");

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("touchstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
    });

    draggable.addEventListener("touchend", () => {
      draggable.classList.remove("dragging");
    });
  });

  // for desktop
  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      const draggable = document.querySelector(".dragging");

      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
        checkedTaskAfterDragging(draggable, container);
        checkCompleteSummary();
      }

      if (container.classList.contains("checked-container")) {
        draggable.classList.add("checked");
        draggable.childNodes[3].setAttribute("contenteditable", false);
        draggable.childNodes[3].classList.add("checked");
      } else {
        draggable.classList.remove("checked");
        draggable.childNodes[3].classList.remove("checked");
      }
    });
  });

  // for touchscreen
  containers.forEach((container) => {
    container.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(
        container,
        e.changedTouches[0].clientY
      );
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
        checkedTaskAfterDragging(draggable, container);
        checkCompleteSummary();
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function checkedTaskAfterDragging(task, container) {
  checkDataArrayInLocalStorage();

  const draggableEl = [
    ...uncheckedCont.querySelectorAll(".task"),
    ...checkedCont.querySelectorAll(".task"),
  ];
  const tasksArrOnPage = draggableEl.map((item) => {
    return item.id;
  });

  // changing the status checked
  const taskObj = todoListArr.find((item) => {
    return item.id == task.id;
  });

  if (container.classList.contains("checked")) {
    taskObj.checked = true;
  } else {
    taskObj.checked = false;
  }

  // sorting the new array
  const newLocalArr = tasksArrOnPage.map((itemOld) => {
    let newItem;
    todoListArr.forEach((item) => {
      if (item.id == itemOld) {
        newItem = item;
      }
    });
    return newItem;
  });

  localStorage.setItem("todos", JSON.stringify(newLocalArr));
  updateURLFromLocalStorage();
}
