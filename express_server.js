//express_server.js - Add starter code and 

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //Tells the Express app to use EJS as its templating engine.



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);  //express handles this response and returns a object in JSON format
});

app.get("/hello", (req, res) => {
  res.send("<html><body>This is me saying <b>HELLO WORLD</b></body></html>\n"); //returns an HTML response
});

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 }); //for testing variable continuity over get requests


app.listen(PORT, () => {
  console.log(`express_server.js listening on port ${PORT}!`);
});
