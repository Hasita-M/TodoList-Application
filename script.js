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
    li.textContent = task.text;
    if (task.completed) li.classList.add('completed');
    li.dataset.id = task.id;

    let span = document.createElement('span');
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
  } else if (e.target.tagName === 'SPAN') {
    // Delete task
    await fetch(`http://localhost:5001/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  }
});

// Enter key adds task
toDoInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTask();
});

// Initial load
loadTasks();