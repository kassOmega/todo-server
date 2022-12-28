const fs = require("fs");
const express = require("express");
const app = express();
app.use(express.json());

function save(user, data) {
  fs.writeFileSync(`data/db.${user}`, JSON.stringify(data));
}

function load(user) {
  try {
    return JSON.parse(
      fs.readFileSync(`data/db.${user}`, /* file encoding */ "utf8")
    );
  } catch (e) {
    console.log(e);
    save(user, []);
    return [];
  }
}

// returns the todo from memory
app.get("/api/todos", (req, res) => {
  const todos = load(req.headers.user);
  res.json(
    todos.filter((i) =>
      req.query?.status ? req.query?.status == i.status : true
    )
  );
});

// adds the task from req.headers.todo into the todos
app.post("/api/todo", (req, res) => {
  const todos = load(req.headers.user);
  // push on the in memory todos list
  todos.push({ id: todos.length, status: "pending", task: req.headers.todo });
  try {
    // write/save the todos on to db.kassu file
    save(req.headers.user, todos);
  } catch (e) {
    res.status(400).json({ message: e.message });
    return;
  }
  // respond success
  res.send("success");
});

// update a task status
app.put("/api/todo/:id", (req, res) => {
  const todos = load(req.headers.user);
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
    save(req.headers.user, todos);
  } catch (e) {
    res.status(400).json({ message: e.message });
    return;
  }
  // respond success
  res.send("success");
});

app.listen(8000, () => console.log("listinig on 8000"));
