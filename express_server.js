//express_server.js - Add starter code and 

const express = require("express");
const app = express();
const PORT = 3333;

//Tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs"); 

//Tells the web server to understand and process information sent from web forms / POST calls
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "derf91": "http://www.yahoo.com"
};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);  //express handles this response and returns a object in JSON format
});

app.get("/hello", (req, res) => {
  res.send("<html><body>This is me saying <b>HELLO WORLD</b></body></html>\n"); //returns an HTML response
});

app.get("/", (req, res) => {
  res.send("Hello, and again, welcome to the TinyApp URL enrichment center.");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


//must be above the .get method that checks for parameters ids
app.get("/urls/new", (req, res) => { 
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  res.send("this is the url id"); 
});


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`express_server.js listening on port ${PORT}!`);
});


// return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
const randomString = Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

function generateRandomString() {
  // copied from gnerateUID from music library challenge
  // const randomStringA = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);   
  const randomStringB = (Math.random().toString(16).substring(2, 8));  //modified to return a 6 digits/letter string
  console.log(randomStringB);
  return randomStringB;
};