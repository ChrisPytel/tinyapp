//express_server.js - Add starter code and 

const express = require("express");
const app = express();
const PORT = 3333;

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
  res.send("Hello, welcome to the landing page for tinyApp!");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  res.send("this is the url id"); 
});


app.listen(PORT, () => {
  console.log(`express_server.js listening on port ${PORT}!`);
});
