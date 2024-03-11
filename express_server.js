//express_server.js

const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3333; //ive got something running on 8080

//Tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

//Tells the Express app to use cookieParser as its templating engine.
app.use(cookieParser());

//Tells the web server to understand and process information sent from web forms / POST calls
app.use(express.urlencoded({ extended: true }));

//------------------ Global Variables ------------------

const urlDatabase = {
  "32xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "derf91": "http://www.yahoo.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ----------------- Helper Functions -----------------

const generateRandomString = function() {
  const randomString = (Math.random().toString(16).substring(2,8));
  console.log(`Generated a random ID string: ${randomString}`);
  return randomString;
};

const createNewUser = function(email, password) {
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email,
    password
  };
  console.log(`\n\nHeres a list of our updated users: `, users);
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
  console.log(`loginEmail is: ${loginEmail}\nloginPassword is: ${loginPassword}`);
  for (const ID in users) {
    console.log(`We've got id: `,ID);
    if (users[ID].email === loginEmail && users[ID].password === loginPassword) {
      console.log(`${users[ID]} email exists in our database, and password matches`);
      //returns true and the corresponding ID if login OR password are incorrect
      return {verified: true,
        userID: users[ID].id};
    }
  }
  console.log(`Account login credentials incorrect`);
  return {verified: false}; //returns false if login OR password are incorrect
};

//------------------ GET routes ------------------

//json data page
app.get("/urls.json", (req, res) => {
  //express handles this response and returns a object in JSON format
  res.json(urlDatabase);
});

//Renders the landing page
app.get("/", (req, res) => {
  console.log("Loaded Home page.");
  console.log('Cookies: ', req.cookies);
  const templateVars = {
    isLoggedIn: req.cookies["user_id"]
  };
  res.render("urls_home", templateVars);
});

//Renders the webpage for the list of our URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    isLoggedIn: req.cookies["user_id"]
  };
  console.log("Loaded MyURLS page.");
  console.log('Cookies: ', req.cookies);
  res.render("urls_index", templateVars);
});

//Renders the webpage for Create New URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    isLoggedIn: req.cookies["user_id"]
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
      isLoggedIn: req.cookies["user_id"],
      longURL: longURL,
      urls: urlDatabase,
      users
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
    isLoggedIn: req.cookies["user_id"],
    users
  };
  console.log('Cookies: ', req.cookies);
  res.render("register", templateVars);
});

//Renders the webpage for logging into an account
app.get("/login", (req, res) => {
  console.log("Loaded Login page.");
  const templateVars = {
    isLoggedIn: req.cookies["user_id"],
    users
  };
  console.log('Cookies: ', req.cookies);
  res.render("login", templateVars);
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
    isLoggedIn: req.cookies["user_id"],
    users};
  res.render("urls_index", templateVars);
});

//For updating the longURL in our database after pressing Edit button
app.post("/urls/:id", (req, res) => {
  //retrieves our shortURL key from the button name input value
  const shortURL = Object.keys(req.body);
  const updatedURL = req.body[shortURL];
  console.log(`our key is ${shortURL} and value is ${updatedURL}`);
  urlDatabase[shortURL] = updatedURL;
  const templateVars = { 
    isLoggedIn: req.cookies["user_id"],
    urls: urlDatabase,
    users };
  res.render("urls_index", templateVars);
});




/*  ----------------------COME BACK TO THIS LATER --------------

Registering New Users last requirement

Update all endpoints that pass username value to templates to pass entire user object to template instead and change logic as follows:

    Look up user object in users objects using userid cookie value
    Pass user object to templates
    Update _header.ejs to show email instead of username

 ----------------------COME BACK TO THIS LATER --------------  */



//For creating a cookie during login phase, redirects back to homepage when set
app.post("/login", (req, res) => {
  console.log(`LOGIN entered`);
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  //returns status of verification and optional userID value if true
  const verifyLogin = checkLoginCredentials(loginEmail, loginPassword);
  console.log(verifyLogin);

  if (verifyLogin.verified === true) {
    console.log(`Successful login: `, verifyLogin.userID);
    res.cookie('user_id', verifyLogin.userID).redirect('/urls');
  } else if (verifyLogin.verified === false) {
    res.status(400).send("Invalid login credentials, please try again.");
  }
});

//Logs the current user out of the site and wipes any cookies
app.post("/logout", (req, res) => {
  console.log(`LOGOUT entered\n Cookies are:`, req.cookies);
  res.clearCookie('user_id', { path: '/' });
  const templateVars = {
    isLoggedIn: req.cookies["user_id"],
    users
  };
  res.render("login", templateVars);
});


//Handles the request for registering a new user
app.post("/register", (req, res) => {
  console.log("REGISTER entered");
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (req.body.email.trim() === "" || req.body.password.trim() === "") {
    res.status(400).send("E-mail and password cannot be blank");
  } else if (isEmailRegistered(newEmail)) {
    res.status(400).send("E-mail already exists in our Database, try using a different one.");
  }
  //uses our helper function to generate a user to our database and returns the unique ID# and stores it as newID
  const newID = createNewUser(newEmail, newPassword);
  
  if (!users[newID]) {
    res.status(400).send(`Something went wrong, could not create entry for ${newEmail}`);
  }
  if (users[newID]) {
    console.log(`Successful creation in our database, now generating a cookie`);
    const templateVars = {
      isLoggedIn: req.cookies[`user_id`],
      users};
    res.cookie('user_id', newID).render("urls_home", templateVars);
  }
});

//Initialize listener for connected client inputs
app.listen(PORT, () => {
  console.log(`TinyApp URL Shortener server is LIVE!\nListening on port ${PORT}!`);
});