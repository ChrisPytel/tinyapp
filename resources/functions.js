// ----------------- Helper Functions -----------------

const bcrypt = require("bcryptjs");  //Give us access to the hashing tool bycrpyt to secure our passwords/cookies
const database = require('./databases');  //imports our database to perform actions with

//Generates a random string for our shortURLS and UserIDs
const generateRandomString = function() {
  return (Math.random().toString(16).substring(2,8));
};

//Creates a new user after pressing register for a new account
const createNewUser = function(email, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUserID = generateRandomString();
  database.users[newUserID] = {  //Creates a new database entry for our new user and defines values
    id: newUserID,
    email,
    password: hashedPassword
  };
  return newUserID;
};

//Checks against the database entry for that given user to see if it exists already
const isEmailRegistered = function(newUser) {
  for (const ID in database.users) {
    if (newUser === database.users[ID].email) {
      return true;
    }
  }
  return false;
};

//After pressing login button, POST route calls this to verify login credentials
const checkLoginCredentials = function(loginEmail, loginPassword) {
  for (const ID in database.users) {
    if (database.users[ID].email === loginEmail && bcrypt.compareSync(loginPassword, database.users[ID].password)) {
      return {verified: true,    //returns object with a bool and corresponding ID
        userID: database.users[ID].id};
    }
  }
  return {verified: false};  //returns object with false if login/password are incorrect
};

//Check if user with that ID exists, if so return the user object and its values
const getUserByID = function(userID, userDatabase) {
  for (const ID in userDatabase) {
    if (userID === ID) {
      return userDatabase[ID];
    }
  }
};

//Checks our database for a userID match. If so, returns an object of matching URLS
const urlsForUser = function(userID, urlDatabase) {
  let urlsForThisUser = {};
  for (const ID in urlDatabase) {
    if (urlDatabase[ID].userID === userID) {
      urlsForThisUser[ID] = urlDatabase[ID];
    }
  }
  return urlsForThisUser;
};

//Verifies if a user has access to modifiy/delete a given shortURL
const checkURLOwnership = function(userID, shortURL, urlDatabase) {
  return (userID === urlDatabase[shortURL].userID);
};

//Exports modules to use across other files in our project
module.exports = {
  generateRandomString,
  createNewUser,
  isEmailRegistered,
  checkLoginCredentials,
  getUserByID,
  urlsForUser,
  checkURLOwnership
};