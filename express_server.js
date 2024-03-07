//express_server.js

const express = require("express");
const app = express();
const PORT = 3333;

//Tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs"); 
//Tells the web server to understand and process information sent from web forms / POST calls
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "32xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "derf91": "http://www.yahoo.com"
};

//------------------ url handlers ------------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);  //express handles this response and returns a object in JSON format
});

app.get("/hello", (req, res) => {
  res.send("<html><body>This is me saying <b>HELLO WORLD</b></body></html>\n"); //returns an HTML response
});

app.get("/", (req, res) => { 
  res.send("Hello, and again, welcome to the TinyApp URL enrichment center.");
});

//------------------ url handlers ------------------

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { 
  res.render("urls_new"); //renders the webpage for urls/new
});

// app.get("/urls/:id", (req, res) => {
//   res.send("this is the url id"); 
// });


app.post("/urls", (req, res) => {  
  const formBody = req.body;
  const urlID = generateRandomString();
  urlDatabase[urlID] = formBody.longURL;
  console.log(`database after adding`,urlDatabase);
  res.redirect(`/urls/${urlID}`);
});

app.get("/urls/:id", (req, res) => {
  console.log(`this is the special page`);
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`express_server.js listening on port ${PORT}!`);
});

const generateRandomString = function() {
  // randomStringA copied from gnerateUID function from music library challenge
  // const generateUID = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);   
  const randomString = (Math.random().toString(16).substring(2,8));  //modified to return a 6 digits/letter string
  console.log(`Generated a random string ${randomString}`);
  return randomString;
};