//external libraries
const express = require("express");
const PORT = 3333;
const app = express();
app.set("view engine", "ejs"); //Tells the Express app to use EJS as its templating engine.
app.use(express.urlencoded({ extended: true })); //Tells the web server to understand and process information sent from web forms / POST calls

const cookieSession = require('cookie-session'); //replaced cookie-parser with cookie-session
app.use(cookieSession({
  name: 'session',
  keys: ['superSecretKey', 'superSecretKey2'], /* secret keys */
  maxAge: 24 * 60 * 60 * 1000 // Cookie Options (24 hours)
}));

//internal libraries
const helper = require('./resources/functions');
const database = require('./resources/databases');


/*  ================  GET routes  ================  */


//express handles /urls.json and returns an object in JSON format, our database of links
app.get("/urls.json", (req, res) => {
  res.json(database.urls);
});


//Renders the landing page
app.get("/", (req, res) => {
  const isLoggedIn = req.session.user_id;

  const templateVars = {
    isLoggedIn,
    user: helper.getUserByID(isLoggedIn, database.users)
  };
  res.render("urls_home", templateVars);
});


//Renders the webpage for the list of our URLS
app.get("/urls", (req, res) => {
  const isLoggedIn = req.session.user_id;

  const templateVars = {
    isLoggedIn,
    user: helper.getUserByID(isLoggedIn, database.users),
    urls: helper.urlsForUser(isLoggedIn, database.urls)
    // urls: database.urls // can uncomment this to display all URLS and test ownership by pressing delete
  };
  res.render("urls_index", templateVars);
});


//Renders the webpage for Create New URL
app.get("/urls/new", (req, res) => {
  const isLoggedIn = req.session.user_id;

  if (!isLoggedIn) {
    res.redirect("/login");
  }  else {
    const templateVars = {
      isLoggedIn,
      user: helper.getUserByID(isLoggedIn, database.users)
    };
    res.render("urls_new", templateVars);
  }

});


//Renders the webpage for Edit URLs feature
app.get("/urls/:id", (req, res) => {
  const id = req.params.id; //fetches shortURL ID from selected edit button
  
  if (!database.urls[id]) {
    return res.status(404).send("We can't redirect you, URL doesnt exist in our database!");
  } 
  const longURL = database.urls[id].longURL; //gets the corresponding longurl from the database
  const isLoggedIn = req.session.user_id;

   if (!isLoggedIn) {
    return res.status(401).send("Cannot access! User isnt logged in yet!");
  }  else if (isLoggedIn && helper.checkURLOwnership(isLoggedIn, id, database.urls) === false) {  //only the user who owns it can view the edit page for this URL
    return res.status(403).send("Cant view this url details since we dont own it");
  } else if (longURL) {
    const templateVars = { isLoggedIn,
      id,
      longURL,
      urls: database.urls,
      user: helper.getUserByID(isLoggedIn, database.users)
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(404).send("URL_ID was not located in database");
  }
});


//Redirects us to a website if shortID exists and longURL is a valid destination to redirect to
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (!database.urls[shortURL]) {
    return res.status(404).send(`Didnt find a valid URL with that ID to redirect to`);
  } else {
    const longURL = database.urls[shortURL].longURL;
    res.redirect(longURL);
  }
});


//Renders the webpage for registering new user
app.get("/register", (req, res) => {
  const isLoggedIn = req.session.user_id;
  if (isLoggedIn) {
    res.redirect("/urls");
  } else { //Renders our nav buttons to login/register
    const templateVars = {
      isLoggedIn,
      user: helper.getUserByID(isLoggedIn, database.users)
    };
    res.render("register", templateVars);
  }
});


//Renders the webpage for logging into an account
app.get("/login", (req, res) => {
  const isLoggedIn = req.session.user_id;
  if (isLoggedIn) {
    res.redirect("/urls");
  } else { //Renders our nav buttons to login/register
    const templateVars = {
      isLoggedIn,
      user: helper.getUserByID(isLoggedIn, database.users)
    };
    res.render("login", templateVars);
  }
});


/*  ================  POST routes  ================  */


//After recieving an entry from our Create TinyURL field,
//adds a new URL to database and redirects to /urls/:id
app.post("/urls", (req, res) => {
  const isLoggedIn = req.session.user_id;

  if (!isLoggedIn) { //additional protection against malicious curl entry
    return res.status(401).send("User must be logged in to be able to shorten URLs!");
  } else {
    const formBody = req.body.longURL; //stores the submission from Create TinyURL field as formBody
    const urlID = helper.generateRandomString();
    database.urls[urlID] = { longURL: formBody,
      userID: isLoggedIn};
    res.redirect(`/urls/${urlID}`);
  }
});


//After pressing Delete on an entry from the /urls page, wipes that shortURL from the database
app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.body.shortID;
  const isLoggedIn = req.session.user_id;

  if (!isLoggedIn) { //additional protection against malicious curl entry
    return res.status(401).send("User must be logged in to be able to delete URLs!");
  } else if (isLoggedIn && helper.checkURLOwnership(isLoggedIn, idToDelete, database.urls) === false) {
    return res.status(403).send("Cant delete this url since we dont own it");
  } else { //we can edit our URL as we have ownership over it
    delete database.urls[idToDelete];
    res.redirect("/urls");
  }
});


//For updating the longURL in our database after pressing Edit button
app.post("/urls/:id", (req, res) => {
  const shortURL = Object.keys(req.body); //shortURL key comes from the button name value from .ejs file
  const updatedURL = req.body[shortURL];  //new longURL value comes from the data from text field
  const isLoggedIn = req.session.user_id;

  if (!isLoggedIn) { //additional protection against malicious curl entry
    return res.status(401).send("User must be logged in to be able to delete URLs!");
  }  else if (isLoggedIn && helper.checkURLOwnership(isLoggedIn, shortURL, database.urls) === false) {
    return res.status(403).send("Cant edit this url since we dont own it");
  } else { //we can edit our URL as we have ownership over it
    database.urls[shortURL].longURL = updatedURL;
    res.redirect("/urls");
  }
});


//Handles the request after pressing LOGIN button
app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  //returns the status of verification and optional userID value if true
  const verifyLogin = helper.checkLoginCredentials(loginEmail, loginPassword);
  if (verifyLogin.verified === true) {
    req.session.user_id = verifyLogin.userID; //eslint wants this to be camel case. I set it to be distinct from userID
    res.redirect('/urls');
  } else if (verifyLogin.verified === false) {
    return res.status(400).send("Invalid login credentials, please try again.");
  }
});

//Logs the current user out of the site and wipes any stored cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


//Handles the request after pressing REGISTER button
app.post("/register", (req, res) => {
  const newEmail = req.body.email; //comes from the E-mail field
  const newPassword = req.body.password; //comes from the password field
 
  if (!newEmail || !newPassword) {
    return res.status(400).send("E-mail and password cannot be blank");
  } else if (helper.isEmailRegistered(newEmail)) {
    return res.status(400).send("E-mail already exists in our Database, try using a different one.");
  }

  //Creates a new user entry in our database and returns the unique ID# for it
  const newID = helper.createNewUser(newEmail, newPassword);

  if (!database.users[newID]) { //checks if succesfully added user to our object
    return res.status(500).send(`Something went wrong, could not create database entry for ${newEmail}`);
  } else if (database.users[newID]) {
    req.session.user_id = newID; //eslint wants this to be camel case. I set it to be distinct from userID
    res.redirect('/urls');
  }
});

//Initialize listener for connected client inputs
app.listen(PORT, () => {
  console.log(`TinyApp URL Shortener server is LIVE!\nListening on port ${PORT}!`);
});