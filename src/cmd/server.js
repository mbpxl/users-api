const express = require("express");
const joi = require("joi");
const fs = require("fs");
const path = require("path");

const PORT = 8000;
const app = express();

let uniqueId = 0;

const filePath = path.join(__dirname, "../pkg/data/users.json");

function loadUsersFromFile() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveUsersToFile(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf8");
}

let users = loadUsersFromFile();

const user_schema = joi.object({
  firstName: joi.string().min(1).required(),
  secondName: joi.string().min(1).required(),
  age: joi.number().required(),
  city: joi.string().min(1),
})

app.use(express.json());

app.get("/users", (req, res) => {
  res.send({users});
});

app.get("/user/:id", (req, res) => {
  const userId = Number(req.params.id);
  const currentUser = users.find(user => user.id === userId);

  if(currentUser) {
    res.send({currentUser});
  } else {
    res.status(404);
    res.send({currentUser: null});
  }
});

app.post("/user", (req, res) => {
  uniqueId += 1;
  users.push({
    id: uniqueId,
    ...req.body,
  });
  saveUsersToFile(users);
  res.send({users});
});

app.delete("/user/:id", (req, res) => {
  const userId = Number(req.params.id);
  const currentUser = users.find(user => user.id === userId);

  if (currentUser) {
    users = users.filter(user => user.id !== userId);
    saveUsersToFile(users);
    res.send(currentUser);
  } else {
    res.status(404);
    res.send({currentUser: null});
  }
});

app.put("/user/:id", (req, res) => {
  const result = user_schema.validate(req.body);
  if(result.error) {
    return res.status(404).send({error: result.error.details});
  }

  const userId = Number(req.params.id);
  const currentUser = users.find(user => user.id === userId);

  if (currentUser) {
    currentUser.firstName = req.body.firstName;
    currentUser.secondName = req.body.secondName;
    currentUser.age = req.body.age;
    currentUser.city = req.body.city;

    saveUsersToFile(users);
    res.send(currentUser);
  } else {
    res.status(404);
    res.send({currentUser: null});
  }
});

app.listen(PORT, () => {
  console.log("Server started at " + PORT + " port");
});