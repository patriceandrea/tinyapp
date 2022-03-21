const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "urlLong": "https://pomofocus.io/app",
  "shire": 'https://www.facebook.com/',
  "isurfshfg": 'https://web.compass.lighthouselabs.ca/days/today'

};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World' };
  res.render("hello_world", templateVars);
});



app.get("/urls", (req, res) => {

  const urls = {
    "urlLong": "https://pomofocus.io/app",
    "shire": 'https://www.facebook.com/',
    "isurfshfg": 'https://web.compass.lighthouselabs.ca/days/today'

  };

  res.render("urls_index", { urls: urls });
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/new/:id", (req, res) => {
  res.render("urls_new");
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send(` /urls/${generateRandomString()}`);
});

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/u/:shortURL', function (req, res) {
  res.status(404);
  res.send('Url not Found');
});

app.get('/u/:shortURL', function (req, res) {
  res.status(302);
  res.send('Server has restarted and database may have been changed');
});