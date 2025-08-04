const toDoInput = document.getElementById('todoInput');
const listContainer = document.getElementById('list-container');

function addTask(){
    if(toDoInput.value.trim() === '') {
        alert("Please enter a task.");
    } else {
        let li = document.createElement('li'); //creating an HTML element
        li.innerHTML = toDoInput.value;
        listContainer.appendChild(li);
        let span = document.createElement('span'); 
        span.innerHTML = "\u00d7"; // Assigning the 'X' icon
        li.appendChild(span); 
    }
    toDoInput.value = ''; // Clear the input field after adding the task
    saveTasks();
}

listContainer.addEventListener('click', function(e) {
    if(e.target.tagName === 'LI') {
        e.target.classList.toggle('completed'); // Toggle the 'checked' class on click
        saveTasks();
    } else if(e.target.tagName === 'SPAN') {
        e.target.parentElement.remove(); // Remove the task when 'X' is clicked
        saveTasks();
    }
}, false);

toDoInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

function saveTasks(){
    localStorage.setItem('tasks', listContainer.innerHTML);
}

function showTasks() {
    listContainer.innerHTML = localStorage.getItem('tasks') || ''; // Load tasks from localStorage
}
showTasks();