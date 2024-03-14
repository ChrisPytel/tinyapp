// ----------------- Helper Functions -----------------

//Give us access to the hashing tool bycrpyt to secure our passwords/cookies
const bcrypt = require("bcryptjs"); 

//imports our database to perform actions with
const database = require('./databases');

//Generates a random string for our shortURLS and UserIDs
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

  database.users[newUserID] = {  //creates a new database entry for our new user and sets values
    id: newUserID,
    email,
    password: hashedPassword
  };
  console.log(`\nHeres a list of our updated database.users: `, database.users);
  return newUserID;
};

const isEmailRegistered = function(newUser) {
  for (const ID in database.users) {
    if (newUser === database.users[ID].email) {
      console.log(`${newUser} already exists in our database`);
      return true;
    }
  }
  return false;
};

const checkLoginCredentials = function(loginEmail, loginPassword) {
  console.log(`Checking email: ${loginEmail}\nAnd Password: ${loginPassword}`);
  for (const ID in database.users) {
    if (database.users[ID].email === loginEmail && bcrypt.compareSync(loginPassword, database.users[ID].password)) {
      return {verified: true,    //returns object with a bool and corresponding ID
        userID: database.users[ID].id};    
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
  let urlsForThisUser = {};
  for (const ID in urlDatabase) {
    if (urlDatabase[ID].userID === userID) {
      urlsForThisUser[ID] = urlDatabase[ID];
    }
  }
  console.log(`\nHelper: urlsForUser compiled a URLS object for this user:`, urlsForThisUser);
  return urlsForThisUser;
};

const checkURLOwnership = function(userID, shortURL, urlDatabase) {
  console.log(`Checking if ${userID} can modify this url: ${shortURL}`);
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
}