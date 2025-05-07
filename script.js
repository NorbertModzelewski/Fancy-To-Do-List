const API = "http://localhost:3000";
let currentUserId = null;

// Rejestracja


document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const res = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert('✅ Zarejestrowano!');
            currentUserId = data.userId;
            localStorage.setItem("userId", data.userId);
            loadGroupedTasks();
            showApp();
          } else {
            alert('❌ Błąd: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('❌ Nie udało się połączyć z serwerem');
    }
});
// Logowanie
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert('✅ Zalogowano!');
            currentUserId = data.userId;
            localStorage.setItem("userId", data.userId);
            loadGroupedTasks();
            showApp();
        } else {
            alert('❌ Błąd logowania: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('❌ Błąd połączenia z serwerem');
    }
});
document.getElementById('task-form').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const taskTitle = document.getElementById('task-input').value;
    const priority = parseInt(document.getElementById('priority-input').value);
    const deadlineInput = document.getElementById('deadline-input').valueAsDate;
  
    if (!deadlineInput) {
      alert("Proszę podać poprawną datę.");
      return;
    }
  
    const formattedDeadline = formatDate(deadlineInput);
  
    if (!currentUserId) {
      alert("Musisz być zalogowany, żeby dodać zadanie.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          title: taskTitle,
          priority: priority,
          deadline: formattedDeadline,
          description: "",
          status: "to-do"
        })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        addTask(taskTitle, priority, formattedDeadline, "", "to-do", data.taskId);
        document.getElementById('task-form').reset();
      } else {
        alert("❌ Błąd podczas dodawania zadania");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Nie udało się połączyć z serwerem");
    }
  });

function formatDate(date) {
    

    if (!(date instanceof Date) || isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}/${day}/${year}`;
}

function getPriorityLabel(priority) {
    switch (priority) {
        case '1':
            return 'P1';
        case '2':
            return 'P2';
        case '3':
            return 'P3';
        case '4':
            return 'P4';
        default:
            return 'Unknown Priority';
    }
}

function addTask(title, priority, deadline, description = '', status = 'to-do', taskId = null) {
    const listItem = document.createElement('li');
    listItem.className = 'task-item';
    listItem.draggable = true;
    listItem.dataset.id = taskId || ''; // <- przypisz ID (jeśli istnieje)
    listItem.dataset.status = status;

    listItem.innerHTML = `
    <div class="task-box">
      <div class="task-header">
        <div class="task-priority-wrapper">
          <span class="priority-dot priority-${priority}" onclick="togglePriorityMenu(this)"></span>
          <select class="task-priority-select hidden" onchange="updateTask(this)">
            <option value="1" ${priority === 1 ? "selected" : ""}>Bardzo pilne</option>
            <option value="2" ${priority === 2 ? "selected" : ""}>Ważne</option>
            <option value="3" ${priority === 3 ? "selected" : ""}>Do zrobienia</option>
            <option value="4" ${priority === 4 ? "selected" : ""}>Mało ważne</option>
          </select>
        </div>
        <span class="task-title" contenteditable="true" onblur="updateTask(this)">${title}</span>
      </div>
      <span class="task-deadline" onclick="showDatePicker(this)">
      ${deadline}
    </span>
      <div class="task-actions">
        <button onclick="toggleDetails(this)">Details</button>
        <button onclick="removeTask(this)">Delete</button>
        <button onclick="shareTask('${taskId}')">Udostępnij</button>
      </div>
      <div class="task-details" style="display: none;">
        <textarea class="task-description" onchange="updateTask(this)">${description}</textarea>
      </div>
    </div>
  `;


    listItem.addEventListener('dragstart', dragStart);
    listItem.addEventListener('dragend', dragEnd);

    document.getElementById(status).appendChild(listItem);
}

function toggleDetails(button) {
    const taskDetails = button.closest('.task-item').querySelector('.task-details');

    if (taskDetails.style.display === 'none') {
        taskDetails.style.display = 'block';
    } else {
        taskDetails.style.display = 'none';
    }
}

async function updateTask(element) {
    const taskItem = element.closest('.task-item');
    const taskId = taskItem.dataset.id;
  
    if (!taskId) return;
  
    const title = taskItem.querySelector('.task-title')?.textContent || "";
    const description = taskItem.querySelector('.task-description')?.value || "";
    const deadlineRaw = taskItem.querySelector('.task-deadline-input')?.value;
    const deadline = formatDate(new Date(deadlineRaw));
    const priority = parseInt(taskItem.querySelector('.task-priority-select')?.value || "4");
  
    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          title,
          description,
          deadline,
          priority
        })
      });
  
      if (!res.ok) throw new Error("Błąd");
  
      console.log("✅ Zadanie zaktualizowane");
  
      // Ukryj select po zmianie
      if (element.classList.contains('task-priority-select')) {
        element.classList.add("hidden");
  
        // Znajdź kropkę i zaktualizuj kolor
        const wrapper = element.closest('.task-priority-wrapper');
        const dot = wrapper.querySelector('.priority-dot');
  
        dot.classList.remove('priority-1', 'priority-2', 'priority-3', 'priority-4');
        dot.classList.add(`priority-${priority}`);
      }
  
    } catch (err) {
      console.error("❌ Błąd aktualizacji:", err);
      alert("❌ Nie udało się zapisać zmian");
    }
  }

async function removeTask(button) {
    const taskItem = button.closest('.task-item');
    const taskId = taskItem.dataset.id;
  
    if (!taskId) {
      console.warn("Task bez ID – nie można usunąć z bazy");
      taskItem.remove();
      return;
    }
  
    const confirmed = confirm("Na pewno chcesz usunąć to zadanie?");
    if (!confirmed) return;
  
    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE"
      });
  
      if (res.ok) {
        taskItem.remove();
      } else {
        alert("❌ Nie udało się usunąć zadania z bazy");
      }
    } catch (err) {
      console.error("❌ Błąd:", err);
      alert("❌ Błąd połączenia z serwerem");
    }
  }

let draggedItem = null;

function dragStart(e) {
    draggedItem = this;
    setTimeout(() => this.style.display = "none", 0);
}

function dragEnd(e) {
    setTimeout(() => {
        this.style.display = "block";
        draggedItem = null;
    }, 0);
}

document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('dragover', e => e.preventDefault());

    list.addEventListener('drop', function () {
        if (draggedItem) {
            this.appendChild(draggedItem);
            updateTaskStatus(this.id, draggedItem);
        }
    });
});

function updateTaskStatus(newStatus, item) {
    const taskId = item.dataset.id;
    if (!taskId) return;
  
    fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => {
      if (res.ok) {
        console.log("✅ Status zapisany:", newStatus);
      } else {
        console.warn("⚠️ Nie udało się zapisać statusu");
      }
    })
    .catch(err => console.error("❌ Błąd zapisu statusu:", err));
  }
  async function loadGroupedTasks() {
    const res = await fetch(`${API}/tasks/${currentUserId}`);
    const tasks = await res.json();
  
    const myTasks = tasks.filter(t => {
      const id = typeof t.userId === "object" ? t.userId._id : t.userId;
      return String(id) === String(currentUserId);
    });
  
    const sharedTasks = tasks.filter(t => {
      const id = typeof t.userId === "object" ? t.userId._id : t.userId;
      return String(id) !== String(currentUserId);
    });
  
    console.log("✅ Moje:", myTasks);
    console.log("👥 Udostępnione:", sharedTasks);
  
    clearAllTaskLists();
  
    myTasks.forEach(task => {
      addTask(task.title, task.priority, task.deadline, task.description, task.status, task._id);
    });
  
    const sharedContainer = document.getElementById("shared-task-list");
sharedContainer.innerHTML = ""; // czyścimy kontener

sharedTasks.forEach(task => {
  // używamy addTask, ale do kontenera shared!
  const listItem = createTaskElement(task); // ← własna funkcja (poniżej)
  sharedContainer.appendChild(listItem);
});
  }
function togglePriorityMenu(dot) {
    const wrapper = dot.closest(".task-priority-wrapper");
    const select = wrapper.querySelector("select");
    select.classList.toggle("hidden");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      currentUserId = storedUserId;
      showApp();
      loadGroupedTasks();
    } else {
        showLogin();
    }
  });
  function showApp() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";
  }
  
  function showLogin() {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("app-section").style.display = "none";
  }
  document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("userId");
    currentUserId = null;
    showLogin();
  });
  function formatForDateInput(dateString) {
    const [month, day, year] = dateString.split("/");
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  function showDatePicker(span) {
    const taskItem = span.closest('.task-item');
    const currentValue = span.textContent.trim();
  
    // Konwersja z MM/DD/YYYY na YYYY-MM-DD
    const [month, day, year] = currentValue.split('/');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
    const input = document.createElement('input');
    input.type = 'date';
    input.value = isoDate;
    input.className = 'task-deadline-input';
  
    // Zamień <span> na <input>
    span.replaceWith(input);
    input.focus();
  
    input.addEventListener('blur', () => {
      const newDate = input.value;
      if (!newDate) return;
  
      const d = new Date(newDate);
      const formatted = formatDate(d); // MM/DD/YYYY
  
      // Tworzymy nowy <span> z datą i onclickiem
      const newSpan = document.createElement('span');
      newSpan.className = 'task-deadline';
      newSpan.textContent = formatted;
      newSpan.onclick = () => showDatePicker(newSpan);
  
      input.replaceWith(newSpan);
  
      // Zapisz do Mongo
      updateTask(newSpan);
    });
  }
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  }
  function showTab(tab) {
    document.getElementById("my-tasks-tab").style.display = tab === "my" ? "block" : "none";
    document.getElementById("shared-tasks-tab").style.display = tab === "shared" ? "block" : "none";
  }
  async function shareTask(taskId) {
    const targetUsername = prompt("Podaj nazwę użytkownika, któremu chcesz udostępnić:");
    if (!targetUsername) return;
  
    try {
      const res = await fetch(`${API}/tasks/${taskId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername })
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("✅ Udostępniono zadanie użytkownikowi " + targetUsername);
      } else {
        alert("❌ Błąd: " + data.error);
      }
    } catch (err) {
      console.error("❌ Błąd połączenia:", err);
      alert("❌ Nie udało się połączyć z serwerem");
    }
  }
  function clearAllTaskLists() {
    document.getElementById("to-do").innerHTML = "";
    document.getElementById("in-progress").innerHTML = "";
    document.getElementById("done").innerHTML = "";
  }
  function displaySharedTaskText(task) {
    const sharedList = document.getElementById("shared-tasks-list");
    const li = document.createElement("li");
    li.textContent = `${task.title} (${task.deadline})`;
    sharedList.appendChild(li);
  }
  function createTaskElement(task) {
    const listItem = document.createElement('li');
    listItem.className = 'task-item';
    listItem.draggable = false;
    listItem.dataset.id = task._id;
  
    listItem.innerHTML = `
      <div class="task-content">
        <div class="task-priority">
          <span class="priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
        </div>
        <span class="task-title">${task.title}</span>
        <div class="task-deadline">${task.deadline}</div>
        <div>
          <button onclick="toggleDetails(this)">Szczegóły</button>
        </div>
      </div>
      <div class="task-details" style="display: none;">
        <textarea class="task-description" disabled>${task.description}</textarea>
      </div>
      <div class="task-shared-by">Udostępnione przez: ${task.userId?.username || 'nieznany'}</div>
    `;
    return listItem;
  }
  function showTab(tab) {
    const myTab = document.querySelector(".task-columns");
    const sharedTab = document.getElementById("shared-tasks-container");
  
    if (tab === "my") {
      myTab.style.display = "flex";
      sharedTab.style.display = "none";
    } else {
      myTab.style.display = "none";
      sharedTab.style.display = "block";
    }
  }

// FILTERS
document.getElementById('filter-priority').addEventListener('change', filterTasks);
document.getElementById('filter-status').addEventListener('change', filterTasks);
document.getElementById('filter-text').addEventListener('input', filterTasks);

function filterTasks() {
  const priorityFilter = document.getElementById('filter-priority').value;
  const statusFilter = document.getElementById('filter-status').value;
  const textFilter = document.getElementById('filter-text').value.toLowerCase();

  const allTasks = document.querySelectorAll('.task-item');

  allTasks.forEach(task => {
    const dot = task.querySelector('.priority-dot');
    const taskPriority = dot ? dot.className.match(/priority-(\d)/)?.[1] : null;
    const taskTitle = task.querySelector('.task-title')?.innerText.toLowerCase();
    const parentStatus = task.closest('.column')?.dataset.status;

    const matchesPriority = !priorityFilter || taskPriority === priorityFilter;
    const matchesStatus = !statusFilter || parentStatus === statusFilter;
    const matchesText = !textFilter || (taskTitle && taskTitle.includes(textFilter));

    task.style.display = (matchesPriority && matchesStatus && matchesText) ? '' : 'none';
  });
  document.addEventListener("DOMContentLoaded", () => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      currentUserId = storedUserId;
      showApp();
      loadGroupedTasks();
    } else {
      showLogin();
    }
  
    // filtry 🔽
    const priorityFilter = document.getElementById('filter-priority');
    const statusFilter = document.getElementById('filter-status');
    const textFilter = document.getElementById('filter-text');
  
    if (priorityFilter && statusFilter && textFilter) {
      priorityFilter.addEventListener('change', filterTasks);
      statusFilter.addEventListener('change', filterTasks);
      textFilter.addEventListener('input', filterTasks);
    }
  });
  
}
