const toDoInput = document.getElementById('todoInput');
const listContainer = document.getElementById('list-container');

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

// Load tasks from backend
async function loadTasks() {
  const res = await fetch('http://localhost:5001/tasks');
  const tasks = await res.json();
  listContainer.innerHTML = '';

  tasks.forEach(task => {
    let li = document.createElement('li');
    //li.textContent = task.text; - separate text node
    li.dataset.id = task.id;
    li.dataset.text = task.text;
    if (task.completed) li.classList.add('completed');

    // Clearing li content and inserting a text node only for the task text
    li.textContent = '';
    li.appendChild(document.createTextNode(task.text)); 

    //Icons

    let editSpan = document.createElement('span');
    editSpan.classList.add('edit-icon');
    editSpan.innerHTML = "\u270E";
    li.appendChild(editSpan);


    let span = document.createElement('span');
    span.classList.add('delete-icon');
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    listContainer.appendChild(li);
  });
}

// Click listener for complete/delete
listContainer.addEventListener('click', async function(e) {
  const li = e.target.closest('li');
  const id = li?.dataset.id;

  if (!id) return;

  if (e.target.tagName === 'LI') {
    // Toggle completion
    await fetch(`http://localhost:5001/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !li.classList.contains('completed') })
    });
    loadTasks();
  } else if (e.target.classList.contains('delete-icon')) {
    // Delete task
    await fetch(`http://localhost:5001/tasks/${id}`, { method: 'DELETE' });
    loadTasks();

  } else if (e.target.classList.contains('edit-icon')) {
    // Edit task
    makeTaskEditable(li, id, li.dataset.text);
  }
});

// Make task editable
async function makeTaskEditable(li, id, currentText) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;

  li.innerHTML = ''; // Clear existing li content
  li.appendChild(input);
  
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  async function saveEdit() {
    const newText = input.value.trim();
    if (newText && newText !== currentText){
      try {
        await fetch(`http://localhost:5001/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newText })
        });
      } catch (error){
        console.error('Failed to update task:', error);
        alert('Sorry, there was a problem updating the task. Please try again.');
      }
    }
    loadTasks();
  }
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    else if (e.key === 'Escape') loadTasks();
  });

  input.addEventListener('blur', saveEdit);
}

// Enter key adds task
toDoInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTask();
});

// Initial load
loadTasks();