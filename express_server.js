//express_server.js

const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3333;

//Tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

//Tells the Express app to use cookieParser as its templating engine.
app.use(cookieParser());

//Tells the web server to understand and process information sent from web forms / POST calls
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "32xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "derf91": "http://www.yahoo.com",
};

//------------------ Initial handlers ------------------

//Renders the landing page
app.get("/", (req, res) => {
  console.log("Loaded Home page.");
  console.log('Cookies: ', req.cookies);
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_home", templateVars);
});

//html test page
app.get("/hello", (req, res) => {
  res.send("<html><body>This is me saying <b>HELLO WORLD</b></body></html>"); //returns an HTML response
});

//json data page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);  //express handles this response and returns a object in JSON format
});

//------------------ GET routes ------------------

//Renders the webpage for the list of our URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  console.log("Loaded MyURLS page.");
  console.log('Cookies: ', req.cookies);
  res.render("urls_index", templateVars);
});

//Renders the webpage for Create New URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  console.log("Loaded Create TinyURL page.");
  res.render("urls_new", templateVars);
});


//Renders the webpage for Edit URLs feature
app.get("/urls/:id", (req, res) => {
  const id = req.params.id; //gets our id from selected edit button
  const longURL = urlDatabase[id];
  if (longURL) {
    console.log("Loaded tinyURL Editor page.");
    const editTemplateVars = { id: id,
      longURL: longURL,
      urls: urlDatabase,
      username: req.cookies["username"]
    }; 
    res.render("urls_show", editTemplateVars); //passes our id/url as obj
  } else {
    res.status(404).send("URL_ID was not located in database");
  }
});

//Redirects us to a website if shortID exists and longURL is a valid destination to redirect to
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  // console.log(`\nShort URL is ${shortURL}.\nLong URL is: ${longURL}`);
  if (!urlDatabase[shortURL]) {
    res.status(404).send(`Didnt find a valid URL with that ID to redirect to`);
  } else {
    console.log(`\nURL Found!\nRedirecting you to: ${longURL}`);
    res.redirect(longURL);
  }
});

//Renders the webpage for registering new user
app.get("/register", (req, res) => {
  console.log("Loaded Registry page.");
  const templateVars = {
    username: req.cookies["username"]
  };  
  console.log('Cookies: ', req.cookies);
  res.render("register", templateVars);
});



// ------------------ POST routes ------------------


//After recieving an entry from our Create TinyURL field, adds a new URL to database and redirects to the /urls/:id
app.post("/urls", (req, res) => {
  const formBody = req.body;
  const urlID = generateRandomString();
  urlDatabase[urlID] = formBody.longURL;
  console.log(`ADDED NEW URL, urlDatabase is now:\n`, urlDatabase);
  res.redirect(`/urls/${urlID}`);
});


//After pressing delete on an entry from the MyURLS page, wipes that shortURL from the database and re-renders the MyURLS page
app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.body.shortID;
  console.log(`\nDELETE URL PRESSED, ID we are deleting is:`, idToDelete);
  delete urlDatabase[idToDelete];
  console.log(`Updated urlDatabase is now:\n`, urlDatabase);
  const templateVars = { urls: urlDatabase,
  username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//For updating the longURL in our database after pressing Edit button
app.post("/urls/:id", (req, res) => {
  //retrieves our shortURL key from the button name input value
  const shortURL = Object.keys(req.body);
  const updatedURL = req.body[shortURL];
  console.log(`our key is ${shortURL} and value is ${updatedURL}`);
  urlDatabase[shortURL] = updatedURL;
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


//For creating a cookie during login phase, redirects back to homepage when set
app.post("/login", (req, res) => {
  console.log(`LOGOUT entered`);
  const username = req.body.userName;
  if (!username) {
    res.status(400).send("Invalid username");
  } else {
    console.log(`post`, username);
    res.cookie('username', username).redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  console.log(`LOGOUT entered`);
  console.log('Cookies: ', req.cookies);
  res.clearCookie('username', { path: '/' });
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_home", templateVars);
});

//Initialize listener for connected client inputs
app.listen(PORT, () => {
  console.log(`TinyApp URL Shortener server is LIVE!\nListening on port ${PORT}!`);
});


// ----------------- Helper Functions -----------------
const generateRandomString = function() {
  const randomString = (Math.random().toString(16).substring(2,8));
  console.log(`Generated a random ID string: ${randomString}`);
  return randomString;
};