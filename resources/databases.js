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


module.exports = {
  urls: urlDatabase,
  users
}