//Importing libraries
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

//Creating an instance of express
const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//MySQL Database connection
require('dotenv').config();  // Load environment variables from .env

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

//Task model
const Task = sequelize.define('Task', {
  text: { type: DataTypes.STRING, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('dueDate');
      if (!rawValue) return null;
    
      // Format JS Date object as 'YYYY-MM-DD'
      //Getting UTC components to avoid timezone issues
      const year = rawValue.getUTCFullYear();
      const month = String(rawValue.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based so adding 1 to show correct month
      const day = String(rawValue.getUTCDate()).padStart(2, '0');
    
      return `${year}-${month}-${day}`;
    }
  }
});

sequelize.sync(); // Sync models with database

//Handle GET request for tasks list
app.get('/tasks', async (req, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
});

//Handle POST request to add a new task - sends the tasks
app.post('/tasks', async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

//Handle PATCH request to update a task
app.patch('/tasks/:id', async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (task) {
      await task.update(req.body);
      res.json(task);
  } else {
      res.status(404).json({ error: 'Task not found' });
  }
});

//Handle DELETE request to delete a task
app.delete('/tasks/:id', async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (task) {
      await task.destroy();
      res.json({ message: 'Deleted' });
  } else {
      res.status(404).json({ error: 'Task not found' });
  }
});

//Starting the server
const PORT = 5001; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
