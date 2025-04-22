document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const taskInput = document.getElementById('task-input').value;
    const priorityInput = document.getElementById('priority-input').value;
    const deadlineInput = document.getElementById('deadline-input').valueAsDate; // Ensure the date is captured correctly

    


    if (!deadlineInput) {
        alert("Please enter a valid deadline.");
        return; // Prevent task creation if deadline is not provided
    }

    

    


    

    const formattedDeadline = formatDate(deadlineInput); // Format the date
    addTask(taskInput, priorityInput, formattedDeadline); // Use the formatted date

    document.getElementById('task-form').reset();
});

function formatDate(date) {
    

    if (!(date instanceof Date) || isNaN(date.getTime())) return ""; // Handle invalid date

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}/${day}/${year}`; // Return formatted date as mm/dd/yyyy
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
    const taskList = document.getElementById('task-list');

    const listItem = document.createElement('li');
    listItem.className = 'task-item';
    listItem.innerHTML = `
        <div style="display: flex; align-items: center; width: 100%;">
            <div class="task-priority" style="margin-left: 10px; font-size: larger;"> <span class="priority-${priority}">${getPriorityLabel(priority)}</span></div>
            <span class="task-title" style="color: white;">${task}</span>
            <div style="margin-left: auto; display: flex; justify-content: flex-end; width: 100%;">
                <span class="task-deadline" style="margin-right: 10px; color: white; font-style: italic;">${deadline}</span>
                <button type="button" onclick="toggleDetails(this)" style="background-color: #9b59b6; color: white;">Details</button>
                <button type="button" onclick="removeTask(this)" style="background-color: #4a2c4a; color: white;">Delete Task</button>
            </div>
        </div>
        <div class="task-details" style="display: none; width: 100%;">
            <div class="task-progress" style="margin-right: 10px; text-align: right; color: white;">Status: <select onchange="updateTask(this)" style="background-color: #4a4a4a; color: white;">
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select></div>
            <textarea class="task-description" onchange="updateTask(this)" style="resize: none; overflow-y: auto; background-color: #4a4a4a; color: white; width: 100%;"></textarea>
        </div>
    `;
    taskList.appendChild(listItem);
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
    const deadlineText = taskItem.querySelector('.task-deadline').innerText.replace("Deadline: ", ""); // Remove "Deadline: " for parsing
    const description = taskItem.querySelector('.task-description').value;

    


    // Extract the date from the text and convert it to a Date object
    const deadlineParts = deadlineText.split('/');
    const deadlineDate = new Date(`${deadlineParts[2]}-${deadlineParts[0]}-${deadlineParts[1]}`); // Convert to YYYY-MM-DD format

    taskItem.querySelector('.task-deadline').innerText = `${formatDate(deadlineDate)}`;

    taskItem.querySelector('.task-description').innerText = description;
}

function removeTask(button) {
    const taskItem = button.closest('.task-item');
    taskItem.remove();
}
