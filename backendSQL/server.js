const express = require("express");
const cors = require("cors");
require('dotenv').config(); // Add this to load environment variables

const port = process.env.PORT || 5001;

const app = express();
app.use(cors());
app.use(express.json());

const tasksRouter = require('./routes/tasks');
app.use('/tasks', tasksRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});