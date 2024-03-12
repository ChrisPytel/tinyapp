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

//------------------ Global Variables ------------------

const urlDatabase = {
  "32xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "f63g41"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "f63g41"},
  "derf91": {longURL: "http://www.yahoo.com", userID: "hy3j9v"}
};

const users = {
  f63g41: {
    id: "f63g41",
    email: "user@example.com",
    password: "purple",
  },
  hy3j9v: {
    id: "hy3j9v",
    email: "user2@example.com",
    password: "funky",
  },
};

// ----------------- Helper Functions -----------------

//Generates a random string for our shortURLS and UserIDs/cookies
const generateRandomString = function() {
  const randomString = (Math.random().toString(16).substring(2,8));
  console.log(`Generated a random ID string: ${randomString}`);
  return randomString;
};


//Creates a new user after pressing register for a new account
const createNewUser = function(email, password) {
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email,
    password
  };
  console.log(`\nHeres a list of our updated users: `, users);
  return newUserID;
};

const isEmailRegistered = function(newUser) {
  for (const ID in users) {
    if (newUser === users[ID].email) {
      console.log(`${newUser} already exists in our database`);
      return true;
    }
  }
  return false;
};

const checkLoginCredentials = function(loginEmail, loginPassword) {
  console.log(`Checking email: ${loginEmail}\nAnd Password: ${loginPassword}`);
  for (const ID in users) {
    if (users[ID].email === loginEmail && users[ID].password === loginPassword) {
      //returns true and the corresponding ID if login + password match database
      return {verified: true,
        userID: users[ID].id};
    }
  }
  return {verified: false};  //returns object with false if login OR password are incorrect
};

//check if user with that id exists, if so return it
const getUserByID = function(userID, userDatabase) {
  for (const ID in userDatabase) {
    if (userID === ID) {
      return userDatabase[ID];
    }
  }
};

//Checks our database if userID corresponds to userID we passed in, returns an object of matching URLS
const urlsForUser = function(userID, urlDatabase){
  console.log(`userid is:`, userID);
  let usersURLs = {};
  for (const ID in urlDatabase) {    
    if (urlDatabase[ID].userID === userID) {
      usersURLs[ID] = urlDatabase[ID];
    }
  }
  console.log(`our compiled URLS object for this user is:`, usersURLs);
  return usersURLs;
}

//------------------ GET routes ------------------

//express handles /urls.json and returns an object in JSON format, our database of links
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Renders the landing page
app.get("/", (req, res) => {
  console.log("Loaded Home page.");
  const templateVars = {
    isLoggedIn: req.cookies["user_id"],
    user: getUserByID(req.cookies["user_id"], users)
  };
  res.render("urls_home", templateVars);
});

//Renders the webpage for the list of our URLS
app.get("/urls", (req, res) => {
  const isLoggedIn = req.cookies["user_id"];
  console.log("id corresponding to cookie is:", isLoggedIn);

  // if (!isLoggedIn){ 
  //   console.log(`\nUser isnt logged in yet! Cannot display URLS`);
  //   res.status(403).send("oops"); //Still renders the webpage and provides optional login button
  // }  else{
    const templateVars = {
      // urls: urlDatabase,
      isLoggedIn: req.cookies["user_id"],
      user: getUserByID(isLoggedIn, users),
      urls: urlsForUser(isLoggedIn, urlDatabase)
    };
    console.log("Loaded MyURLS page.");
    res.render("urls_index", templateVars);
  });

//Renders the webpage for Create New URL
app.get("/urls/new", (req, res) => {
  const isLoggedIn = req.cookies["user_id"];

  if (!isLoggedIn){
    console.log(`\nUser isnt logged in yet! Redirected to /login`);
    res.redirect("/login");
  }  else{
    const templateVars = {
      isLoggedIn,
      user: getUserByID(isLoggedIn, users)
    };
    console.log("Loaded CREATE page.");
    res.render("urls_new", templateVars);
  }

});


//Renders the webpage for Edit URLs feature
app.get("/urls/:id", (req, res) => {
  const id = req.params.id; //gets our id from selected edit button
  const longURL = urlDatabase[id];
  const isLoggedIn = req.cookies["user_id"];

  if (!isLoggedIn){
    console.log(`\nUser isnt logged in yet!`);
    res.status(403).send("Cannot access! User isnt logged in yet!");
  }  else{    
    if (longURL) {
      console.log("Loaded tinyURL EDITOR page.");
      const editTemplateVars = { id: id,
        isLoggedIn,
        longURL: longURL,
        urls: urlDatabase,
        user: getUserByID(req.cookies["user_id"], users)
      };
      res.render("urls_show", editTemplateVars); //passes our id/url as obj
    } else {
      res.status(404).send("URL_ID was not located in database");
    }
  }
});

//Redirects us to a website if shortID exists and longURL is a valid destination to redirect to
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]) {
    res.status(404).send(`Didnt find a valid URL with that ID to redirect to`);
  } else {
    console.log(`\nURL Found!\nRedirecting you to: ${longURL}`);
    res.redirect(longURL);
  }
});

//Renders the webpage for registering new user
app.get("/register", (req, res) => {
  const isLoggedIn = req.cookies["user_id"];
  console.log(`Stored cookie:`, isLoggedIn);

  if (isLoggedIn){
    console.log(`user is already logged in, redirecting to /urls`);
    res.redirect("/urls");
  } else{
    console.log("Loaded Registry page.");
    const templateVars = {
      isLoggedIn,
      user: getUserByID(isLoggedIn, users)
    };
    res.render("register", templateVars);
  }
});

//Renders the webpage for logging into an account
app.get("/login", (req, res) => {
  const isLoggedIn = req.cookies["user_id"];
  console.log(`Stored cookie:`, isLoggedIn);

  if (isLoggedIn){
    console.log(`user is already logged in, redirecting to /urls`);
    res.redirect("/urls");
  } else{
    console.log("Loaded Login page.");
    const templateVars = {
      isLoggedIn,
      user: getUserByID(isLoggedIn, users)
    };
    res.render("login", templateVars);
  }
});


// ------------------ POST routes ------------------

//After recieving an entry from our Create TinyURL field, adds a new URL to database and redirects to the /urls/:id
app.post("/urls", (req, res) => {
  const isLoggedIn = req.cookies["user_id"];
  console.log(`Stored cookie:`, isLoggedIn);

  if (!isLoggedIn){ //additional protection against malicious curl entry
    res.response(403).send("User must be logged in to be able to shorten URLs!")
  } else{
    const formBody = req.body; //stores the submission from Create TinyURL field as formBody
    const urlID = generateRandomString();
    urlDatabase[urlID] = formBody.longURL;
    console.log(`\nADDED NEW URL!\nurlDatabase is now:\n`, urlDatabase);
    res.redirect(`/urls/${urlID}`);
  }
});

//After pressing delete on an entry from the MyURLS page, wipes that shortURL from the database and re-renders the MyURLS page
app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.body.shortID;
  console.log(`\nDELETE URL PRESSED, ID we are deleting is:`, idToDelete);
  delete urlDatabase[idToDelete];
  console.log(`Updated urlDatabase is now:\n`, urlDatabase);
  res.redirect("/urls");
});

//For updating the longURL in our database after pressing Edit button
app.post("/urls/:id", (req, res) => {
  //retrieves our shortURL key from the button name input value
  const shortURL = Object.keys(req.body);
  const updatedURL = req.body[shortURL];
  console.log(`our key is ${shortURL} and value is ${updatedURL}`);
  urlDatabase[shortURL] = updatedURL;
  res.redirect("/urls");
});

//For creating a cookie during login phase, redirects back to homepage when set
app.post("/login", (req, res) => {
  console.log(`LOGIN post route entered`);
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  //returns status of verification and optional userID value if true
  const verifyLogin = checkLoginCredentials(loginEmail, loginPassword);

  if (verifyLogin.verified === true) {
    console.log(`Successful login: `, verifyLogin.userID);
    res.cookie('user_id', verifyLogin.userID).redirect('/urls');
  } else if (verifyLogin.verified === false) {
    console.log(`Successful login`);
    res.status(400).send("Invalid login credentials, please try again.");
  }
});

//Logs the current user out of the site and wipes any stored cookies
app.post("/logout", (req, res) => {
  console.log(`LOGOUT post route entered`);
  res.clearCookie('user_id', { path: '/' });
  res.redirect("/login");
});

//Handles the request for registering a new user
app.post("/register", (req, res) => {
  console.log("REGISTER post route entered");
  const newEmail = req.body.email;
  const newPassword = req.body.password;
 
  if (!newEmail || !newPassword) {
    res.status(400).send("E-mail and password cannot be blank");
  } else if (isEmailRegistered(newEmail)) {
    res.status(400).send("E-mail already exists in our Database, try using a different one.");
  }
  //uses our helper function to generate a user to our database and returns the unique ID#
  const newID = createNewUser(newEmail, newPassword);
  
  //checks if succesfully added user to our object
  if (!users[newID]) {
    res.status(500).send(`Something went wrong, could not create database entry for ${newEmail}`);
  } else if (users[newID]) {
    console.log(`Successful creation in our database, returning to login page`);
    res.redirect("/");
  }
});

//Initialize listener for connected client inputs
app.listen(PORT, () => {
  console.log(`TinyApp URL Shortener server is LIVE!\nListening on port ${PORT}!`);
});