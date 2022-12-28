const fs = require("fs");
const express = require("express");
const app = express();
app.use(express.json());

// read todos from file and parse from string json to object
const todos = JSON.parse(
  fs.readFileSync("db.kassu", /* file encoding */ "utf8")
);

// returns the todo from memory
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// adds the task from req.headers.todo into the todos
app.post("/api/todo", (req, res) => {
  // push on the in memory todos list
  todos.push({ id: todos.length, status: "pending", task: req.headers.todo });
  try {
    // write/save the todos on to db.kassu file
    fs.writeFileSync("db.kassu", JSON.stringify(todos));
  } catch (e) {
    res.status(400).json({ message: e.message });
    return;
  }
  // respond success
  res.send("success");
});

// update a task status
app.put("/api/todo/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!["pending", "done"].includes(req.body?.status)) {
    res.status(402).json({ message: "invalid status" });
    return;
  }
  let found = false;
  for (const todo of todos) {
    if (todo.id === id) {
      found = true;
      todo.status = req.body.status;
      break;
    }
  }
  if (!found) {
    res.status(402).json({ message: "task not found" });
    return;
  }
  try {
    // write/save the todos on to db.kassu file
    fs.writeFileSync("db.kassu", JSON.stringify(todos));
  } catch (e) {
    res.status(400).json({ message: e.message });
    return;
  }
  // respond success
  res.send("success");
});

app.listen(8000, () => console.log("listinig on 8000"));
