const jwt = require("jsonwebtoken");
const token = jwt.sign({ userId: "dummy-user-id" }, "123123");
fetch("http://localhost:3001/api/v1/workspaces", {
  headers: { "Authorization": `Bearer ${token}` }
}).then(r => r.json()).then(console.log).catch(console.error);
