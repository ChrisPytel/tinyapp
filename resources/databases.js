//------------------ Global Variables ------------------
//Non-persistant and resets after each `$ npm start`

//Database containing ALL shortened URLS and the corresponding user that created it.
const urlDatabase = {
  "32xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "test01"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "test01"},
  "derf91": {longURL: "http://www.yahoo.com", userID: "test02"},
  "a9h612": {longURL: "https://www.snesmaps.com/maps/SuperMetroid/SuperMetroidMapZebes.html", userID: "test02"}
};

//Our database containing a list of users that have signed up.
const users = {
  test01: {
    id: "test01",
    email: "user@example.com",
    password: "$2a$10$hUjh46UqaH/BBRFer498/upPfmjTgh/WQOslKZDfkcn9mW8EknFDq",
    //corresponding plain text password for testing is: purple
  },
  test02: {
    id: "test02",
    email: "user2@example.com",
    password: "$2a$10$D5Tptu29M6ozg8eyOJK1hO5qv4TWo6JHFK0jYUMu21Q7hkdlqdKfy",
    //corresponding plain text password for testing is: funky
  }
};

//Exports modules to use across other files in our project
module.exports = {
  urls: urlDatabase,
  users
};