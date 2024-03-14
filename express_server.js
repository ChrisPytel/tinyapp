const express = require("express");
// const cookieParser = require('cookie-parser'); //replaced with cookie-session
const bcrypt = require("bcryptjs"); //Give us access to the hashing tool bycrpyt to secure our passwords/cookies
const cookieSession = require('cookie-session');

const app = express();
const PORT = 3333;

app.set("view engine", "ejs"); //Tells the Express app to use EJS as its templating engine.
// app.use(cookieParser()); //Tells the Express app to use cookieParser as its templating engine.
app.use(express.urlencoded({ extended: true })); //Tells the web server to understand and process information sent from web forms / POST calls


app.use(cookieSession({
  name: 'session',
  keys: ['superSecretKey'], /* secret keys */

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//------------------ Global Variables ------------------

const urlDatabase = {
  "32xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "test01"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "test01"},
  "derf91": {longURL: "http://www.yahoo.com", userID: "test02"}
};

const users = {
  test01: {
    id: "test01",
    email: "user@example.com",
    password: "$2a$10$hUjh46UqaH/BBRFer498/upPfmjTgh/WQOslKZDfkcn9mW8EknFDq", 
    //plain text password is: purple
  },
  test02: {
    id: "test02",
    email: "user2@example.com",
    password: "$2a$10$D5Tptu29M6ozg8eyOJK1hO5qv4TWo6JHFK0jYUMu21Q7hkdlqdKfy",
    //plain text password is: funky
  }
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
  console.log(`Creating a new user with email\n${email}\nand password\n${password}`);

  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(`password after hashing is\n${hashedPassword}`);  

  const newUserID = generateRandomString();
  //creates a new database entry for our new user and enters values
  users[newUserID] = {
    id: newUserID,
    email,
    password: hashedPassword
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
    if (users[ID].email === loginEmail && bcrypt.compareSync(loginPassword, users[ID].password)) {
      return {verified: true,    //returns object with a bool and corresponding ID
        userID: users[ID].id};    
    }
  }
  return {verified: false};  //returns object with false if login/password are incorrect
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
const urlsForUser = function(userID, urlDatabase) {
  let usersURLs = {};
  for (const ID in urlDatabase) {
    if (urlDatabase[ID].userID === userID) {
      usersURLs[ID] = urlDatabase[ID];
    }
  }
  console.log(`\nHelper: urlsForUser compiled a URLS object for this user:`, usersURLs);
  return usersURLs;
};

const checkURLOwnership = function(userID, shortURL, urlDatabase) {
  console.log(`Checking if ${userID} can modify this url: ${shortURL}`);
  return (userID === urlDatabase[shortURL].userID);
};

//------------------ GET routes ------------------

//express handles /urls.json and returns an object in JSON format, our database of links
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Renders the landing page
app.get("/", (req, res) => {
  console.log("Loaded Home page.");
  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);


  const templateVars = {
    isLoggedIn,
    user: getUserByID(isLoggedIn, users)
  };
  res.render("urls_home", templateVars);
});

//Renders the webpage for the list of our URLS
app.get("/urls", (req, res) => {
  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  const templateVars = {
    isLoggedIn,
    user: getUserByID(isLoggedIn, users),
    urls: urlsForUser(isLoggedIn, urlDatabase)
    // urls: urlDatabase // can enable to test ownership over all urls
  };
  console.log("Loaded MyURLS page.");
  res.render("urls_index", templateVars);
});

//Renders the webpage for Create New URL
app.get("/urls/new", (req, res) => {
  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  if (!isLoggedIn) {
    console.log(`\nUser isnt logged in yet! Redirected to /login`);
    res.redirect("/login");
  }  else {
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
  const id = req.params.id; //fetches shortURL ID from selected edit button
  
  if (!urlDatabase[id]) {
    return res.status(403).send("We can't redirect you, URL doesnt exist in our database!");
  }
  const longURL = urlDatabase[id].longURL; //gets the corresponding longurl from the database

  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  console.log();

  if (!isLoggedIn) {
    console.log(`\nUser isnt logged in yet!`);
    return res.status(403).send("Cannot access! User isnt logged in yet!");
  } else if (isLoggedIn && checkURLOwnership(isLoggedIn, id, urlDatabase) === false) {  //only the user who owns it can view the edit page for this URL
    console.log("Cant edit this url since we dont own it");
    return res.status(403).send("Cant view this url details since we dont own it");
  } else if (longURL) {
    console.log("Loaded tinyURL EDITOR page.");
    const editTemplateVars = { isLoggedIn,
      id,
      longURL,
      urls: urlDatabase,
      user: getUserByID(req.cookies["user_id"], users)
    };
    res.render("urls_show", editTemplateVars);
  } else {
    return res.status(404).send("URL_ID was not located in database");
  }
  
});

//Redirects us to a website if shortID exists and longURL is a valid destination to redirect to
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`Didnt find a valid URL with that ID to redirect to`);
  } else {
    console.log(`\nURL Found!\nRedirecting you to: ${longURL}`);
    res.redirect(longURL);
  }
});

//Renders the webpage for registering new user
app.get("/register", (req, res) => {
  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  if (isLoggedIn) {
    console.log(`user is already logged in, redirecting to /urls`);
    res.redirect("/urls");
  } else {
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
  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  if (isLoggedIn) {
    console.log(`user is already logged in, redirecting to /urls`);
    res.redirect("/urls");
  } else {
    console.log("Loaded Login page.");
    const templateVars = {
      isLoggedIn,
      user: getUserByID(isLoggedIn, users)
    };
    res.render("login", templateVars);
  }
});


// ------------------ POST routes ------------------

//After recieving an entry from our Create TinyURL field, adds a new URL to database and redirects to /urls/:id
app.post("/urls", (req, res) => {
  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  if (!isLoggedIn) { //additional protection against malicious curl entry
    return res.response(403).send("User must be logged in to be able to shorten URLs!");
  } else {
    const formBody = req.body.longURL; //stores the submission from Create TinyURL field as formBody
    const urlID = generateRandomString();
    urlDatabase[urlID] = { longURL: formBody,
      userID: isLoggedIn};

    console.log(`\nADDED NEW URL!\nurlDatabase is now:\n`, urlDatabase);
    res.redirect(`/urls/${urlID}`);
  }
});

//After pressing delete on an entry from the MyURLS page, wipes that shortURL from the database and re-renders the MyURLS page
app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.body.shortID;

  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  if (!isLoggedIn) { //additional protection against malicious curl entry
    return res.status(401).send("User must be logged in to be able to delete URLs!");
  }
  //only logged in users can delete their own shortURLs
  else if (isLoggedIn && checkURLOwnership(isLoggedIn, idToDelete, urlDatabase) === false) {
    console.log("Cant delete this url since we dont own it");
    return res.status(403).send("Cant delete this url since we dont own it");
  }
  //we can edit our URL as we have ownership over it
  else {
    console.log(`\nDELETE URL PRESSED, ID we are deleting is:`, idToDelete);
    delete urlDatabase[idToDelete];
    console.log(`Updated urlDatabase is now:\n`, urlDatabase);
    res.redirect("/urls");
  }
});

//For updating the longURL in our database after pressing Edit button
app.post("/urls/:id", (req, res) => {
  const shortURL = Object.keys(req.body); //shortURL key comes from the button name input value
  const updatedURL = req.body[shortURL]; //new longURL value comes from the data from text field
  console.log(`updated url is:`, updatedURL);

  // const isLoggedIn = req.cookies["user_id"]; //old cookie method
  const isLoggedIn = req.session.user_id;
  console.log(`Stored cookie:`, isLoggedIn);

  if (!isLoggedIn) { //additional protection against malicious curl entry
    return res.status(401).send("User must be logged in to be able to delete URLs!");
  }
  //only logged in users can delete their own shortURLs
  else if (isLoggedIn && checkURLOwnership(isLoggedIn, shortURL, urlDatabase) === false) {
    console.log("Cant edit this url since we dont own it");
    return res.status(403).send("Cant edit this url since we dont own it");
  }
  //we can edit our URL as we have ownership over it
  else {
    console.log(`our key is ${shortURL} and value is ${updatedURL}`);
    urlDatabase[shortURL].longURL = updatedURL;
    res.redirect("/urls");
  }
});

//For creating a cookie during login phase, redirects back to homepage when set
app.post("/login", (req, res) => {
  console.log(`LOGIN post route entered`);
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  //returns status of verification and optional userID value if true
  const verifyLogin = checkLoginCredentials(loginEmail, loginPassword);

  if (verifyLogin.verified === true) {
    console.log(`\nSuccessful login:\nWelcome ${loginEmail}:`, verifyLogin.userID);

    // res.cookie('user_id', verifyLogin.userID).redirect('/urls'); //old method for cookie creation
    req.session.user_id = verifyLogin.userID;
    res.redirect('/urls');
    
  } else if (verifyLogin.verified === false) {
    return res.status(400).send("Invalid login credentials, please try again.");
  }
});

//Logs the current user out of the site and wipes any stored cookies
app.post("/logout", (req, res) => {
  console.log(`LOGOUT post route entered`);

  // res.clearCookie('user_id', { path: '/' }); //old method for removing cookies
  req.session = null;

  res.redirect("/login");
});

//Handles the request for registering a new user
app.post("/register", (req, res) => {
  console.log("REGISTER post route entered");
  const newEmail = req.body.email;
  const newPassword = req.body.password;
 
  if (!newEmail || !newPassword) {
    return res.status(400).send("E-mail and password cannot be blank");
  } else if (isEmailRegistered(newEmail)) {
    return res.status(400).send("E-mail already exists in our Database, try using a different one.");
  }
  //uses our helper function to generate a user to our database and returns the unique ID#
  const newID = createNewUser(newEmail, newPassword);
  
  //checks if succesfully added user to our object
  if (!users[newID]) {
    return res.status(500).send(`Something went wrong, could not create database entry for ${newEmail}`);
  } else if (users[newID]) {
    console.log(`Successful creation in our database, returning to login page`);

    res.cookie('user_id', newID).redirect('/urls'); //old method for cookie creation
    // res.cookie('user_id', verifyLogin.userID).redirect('/urls'); 
    req.session.user_id = newID;
    res.redirect('/urls');

  }
});

//Initialize listener for connected client inputs
app.listen(PORT, () => {
  console.log(`TinyApp URL Shortener server is LIVE!\nListening on port ${PORT}!`);
});