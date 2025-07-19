const mysql = require('mysql2/promise');
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const dbConfig = require('../util/db');
require('dotenv').config();

/* GET ALL TASKS */
router.route('/').get(async (req, res) => {
  let sql = 'SELECT * FROM tasks';
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(sql);

    console.log('Fetched tasks:', rows);
    res.json({ result: rows });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/* ADD A NEW TASK */
router.route('/').post(async (req, res) => {
  const newTask = {
    _id: uuidv4(),
    text: req.body.text,
    reminder: req.body.reminder,
    day: req.body.day,
  };

  console.log('Adding new task:', newTask);

  let sql = 'INSERT INTO tasks (_id, text, reminder, day) VALUES (?, ?, ?, ?)';

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(sql, [
      newTask._id,
      newTask.text,
      newTask.reminder,
      newTask.day,
    ]);

    console.log('Task added successfully:', result);
    res.status(201).json({ result: newTask });
    await connection.end();
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

/* GET A TASK */
router.route('/:id').get(async (req, res) => {
  let sql = 'SELECT * FROM tasks WHERE _id = ?';
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('Fetched task:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/* DELETE A TASK */
router.route('/:id').delete(async (req, res) => {
  let sql = 'DELETE FROM tasks WHERE _id = ?';
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(sql, [req.params.id]);
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log('Task deleted successfully:', req.params.id);
    res.json({ result: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/* UPDATE A TASK */
router.route('/:id').put(async (req, res) => {
  const updatedTask = {
    text: req.body.text,
    reminder: req.body.reminder,
    day: req.body.day,
  };

  console.log('Updating task:', updatedTask);

  // prepare SQL statements
  let sql_get = 'SELECT * FROM tasks WHERE _id = ?';
  let sql_update = 'UPDATE tasks SET reminder = ? WHERE _id = ?';
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(sql_get, [req.params.id]);
    const task = rows[0];


    const [result] = await connection.execute(sql_update, [
      task.reminder == 1 ? 0 : 1, // Toggle reminder
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      result: { ...task, reminder: task.reminder == 1 ? 0 : 1 },
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

module.exports = router;
