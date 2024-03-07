//express_server.js

const e = require("express");
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
  "derf91": "http://www.yahoo.com",
};

//------------------ url handlers ------------------

//home page
app.get("/", (req, res) => { 
  res.send("Hello, and again, welcome to the TinyApp URL enrichment center.");
});

//html test page
app.get("/hello", (req, res) => {
  res.send("<html><body>This is me saying <b>HELLO WORLD</b></body></html>\n"); //returns an HTML response
});

//json data page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);  //express handles this response and returns a object in JSON format
});


//------------------ url handlers ------------------

//Renders the webpage for the list of our URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log("Loaded MyURLS page.");
  res.render("urls_index", templateVars);
});

//Renders the webpage for Create New URL
app.get("/urls/new", (req, res) => { 
  console.log("Loaded Create TinyURL page.");
  res.render("urls_new"); 
});

//After recieving an entry from our Create TinyURL field
app.post("/urls", (req, res) => {  
  const formBody = req.body;
  const urlID = generateRandomString();
  urlDatabase[urlID] = formBody.longURL;
  console.log(`Updated urlDatabase is now:\n`, urlDatabase);
  res.redirect(`/urls/${urlID}`);
});

//After pressing delete on an entry from the MyURLS page
app.post("/urls/:id/delete", (req, res) => {  
console.log(`delete url pressed`);
const idToDelete = req.body.shortID;
console.log(idToDelete);
delete urlDatabase[idToDelete];
console.log(`Updated urlDatabase is now:\n`, urlDatabase);
const templateVars = { urls: urlDatabase };
res.render("urls_index", templateVars); 
});

app.get("/urls/:id", (req, res) => { 
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];  
  console.log(`Short url is ${shortURL}. Should redirect us to: ${longURL}` );

  if (!urlDatabase.hasOwnProperty(shortURL)) {
    res.status(404).send(`Didnt find a valid URL with that ID to redirect to`);
  } else {
    console.log(`\nURL Found!\nRedirecting you to: ${longURL}`);
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`express_server.js listening on port ${PORT}!`);
});


const generateRandomString = function() { 
  const randomString = (Math.random().toString(16).substring(2,8));
  console.log(`Generated a random ID string: ${randomString}`);
  return randomString;
};