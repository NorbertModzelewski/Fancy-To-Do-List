document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const taskInput = document.getElementById('task-input').value;
    const priorityInput = document.getElementById('priority-input').value;
    const deadlineInput = document.getElementById('deadline-input').valueAsDate;

    


    if (!deadlineInput) {
        alert("Please enter a valid deadline.");
        return;
    }

    

    


    

    const formattedDeadline = formatDate(deadlineInput);
    addTask(taskInput, priorityInput, formattedDeadline);

    document.getElementById('task-form').reset();
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

function addTask(task, priority, deadline) {
    const listItem = document.createElement('li');
    listItem.className = 'task-item';
    listItem.draggable = true;

    listItem.innerHTML = `
        <div class="task-content">
            <div class="task-priority"><span class="priority-${priority}">${getPriorityLabel(priority)}</span></div>
            <span class="task-title">${task}</span>
            <div class="task-deadline">${deadline}</div>
            <div>
                <button onclick="toggleDetails(this)">Details</button>
                <button onclick="removeTask(this)">Delete</button>
            </div>
        </div>
        <div class="task-details" style="display: none;">
            <textarea class="task-description" onchange="updateTask(this)"></textarea>
        </div>
    `;

    listItem.addEventListener('dragstart', dragStart);
    listItem.addEventListener('dragend', dragEnd);

    document.getElementById('to-do').appendChild(listItem);
}

function toggleDetails(button) {
    const taskDetails = button.closest('.task-item').querySelector('.task-details');

    if (taskDetails.style.display === 'none') {
        taskDetails.style.display = 'block';
    } else {
        taskDetails.style.display = 'none';
    }
}

function updateTask(element) {
    const taskItem = element.closest('.task-item');
    const deadlineText = taskItem.querySelector('.task-deadline').innerText.replace("Deadline: ", "");
    const description = taskItem.querySelector('.task-description').value;

    


    const deadlineParts = deadlineText.split('/');
    const deadlineDate = new Date(`${deadlineParts[2]}-${deadlineParts[0]}-${deadlineParts[1]}`);

    taskItem.querySelector('.task-deadline').innerText = `${formatDate(deadlineDate)}`;

    taskItem.querySelector('.task-description').innerText = description;
}

function removeTask(button) {
    const taskItem = button.closest('.task-item');
    taskItem.remove();
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
    const select = item.querySelector('select');
    if (select) select.value = newStatus;

}



