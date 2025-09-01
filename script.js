const toDoInput = document.getElementById('todoInput');
const listContainer = document.getElementById('list-container');

// Due date: Convert "YYYY-MM-DD" to "DD/MM/YYYY" or show placeholder if not set
function formatDate(dateStr) {
  if (!dateStr) return "DD/MM/YYYY";
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// Add task
async function addTask() {
  if (toDoInput.value.trim() === '') {
    alert("Please enter a task.");
    return;
  }

  await fetch('http://localhost:5001/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: toDoInput.value, completed: false })
  });

  toDoInput.value = '';
  loadTasks();
}

// Load tasks and render
async function loadTasks() {
  const res = await fetch('http://localhost:5001/tasks');
  let tasks = await res.json();

  // Sort tasks by due date
  tasks.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate); //using localeCompare as we get the date in a string like "YYYY-MM-DD" form server.js
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return 0;
  });

  listContainer.innerHTML = '';

  tasks.forEach(task => {
    let li = document.createElement('li');
    li.dataset.id = task.id;
    li.dataset.text = task.text;
    if (task.completed) li.classList.add('completed');

    // Clearing li content and inserting a text node only for the task text
    li.textContent = '';
    li.appendChild(document.createTextNode(task.text));
  
    // Due date display
    let dueDateDisplay = document.createElement('span');
    dueDateDisplay.classList.add('due-date-display');

    dueDateDisplay.textContent = ` ${formatDate(task.dueDate)} `;
    dueDateDisplay.dataset.value = task.dueDate ? task.dueDate : "";
    dueDateDisplay.title = "Click to set or edit due date";
    dueDateDisplay.style.cursor = "pointer";

    if (!task.dueDate) {
      dueDateDisplay.classList.add('placeholder');
    } else {
      dueDateDisplay.classList.remove('placeholder');
    }
    li.appendChild(dueDateDisplay);
  
    // Edit icon
    let editSpan = document.createElement('span');
    editSpan.classList.add('edit-icon');
    editSpan.innerHTML = "\u270E";
    editSpan.title = "Edit task";
    li.appendChild(editSpan);
  
    // Delete icon
    let span = document.createElement('span');
    span.classList.add('delete-icon');
    span.innerHTML = "\u00d7";
    span.title = "Delete task";
    li.appendChild(span);
  
    listContainer.appendChild(li);
  });
}

// Click listener for due date/edit/delete/complete
listContainer.addEventListener('click', async function (e) {
  const li = e.target.closest('li');
  const id = li?.dataset.id;

  if (!id) return;

  if (e.target.classList.contains('due-date-display')) {
    if (li.querySelector('.due-date-input')) return; // prevent multiple inputs
    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'due-date-input';
    input.value = e.target.dataset.value; //pre-fill with raw date
    e.target.style.display = 'none';
    li.appendChild(input);
    input.focus();

    input.addEventListener('change', async function () {
      await fetch(`http://localhost:5001/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: input.value || null })
      });
      loadTasks();
    });

    input.addEventListener('blur', function () {
      setTimeout(loadTasks, 100); // let change update before loading
    });

  } else if (e.target.classList.contains('edit-icon')) {
    // Edit task text
    makeTaskEditable(li, id, li.dataset.text);

  } else if (e.target.classList.contains('delete-icon')) {
    // Delete task
    await fetch(`http://localhost:5001/tasks/${id}`, { method: 'DELETE' });
    loadTasks();

  } else if (e.target.tagName === 'LI') {
    // Toggle completion
    await fetch(`http://localhost:5001/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !li.classList.contains('completed') })
    });
    loadTasks();

  }
});

// Edit task text
async function makeTaskEditable(li, id, currentText) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  li.innerHTML = '';
  li.appendChild(input);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  async function saveEdit() {
    const newText = input.value.trim();
    if (newText && newText !== currentText) {
      try {
        await fetch(`http://localhost:5001/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newText })
        });
      } catch (error) {
        console.error('Failed to update task:', error);
        alert('Sorry, there was a problem updating the task. Please try again.');
      }
    }
    loadTasks();
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    else if (e.key === 'Escape') loadTasks();
  });
  input.addEventListener('blur', saveEdit);
}

// Add on Enter key press
toDoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

loadTasks();