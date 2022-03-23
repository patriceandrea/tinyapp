const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const { request } = require("express");
const { render } = require("ejs");

const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const findEmail = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
}

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
  const urls = urlDatabase;
  const templateVars = {
    urls,
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_index", templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

//showpage
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/urls/new/:id", (req, res) => {
  res.render("urls_new");
});



// generates a new shorturl to the longurl 
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body.longURL;
  console.log(shortUrl, longUrl);
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`/urls/${shortUrl}`);
});

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}




// app.get('/u/:shortURL', function (req, res) {
//   res.status(404);
//   res.send('Url not Found');
// });

// app.get('/u/:shortURL', function (req, res) {
//   res.status(302);
//   res.send('Server has restarted and database may have been changed');
// });

// delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});




// edit long url 
app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.longUrl;
  console.log(shortUrl, longUrl);
  urlDatabase[shortUrl] = longUrl
  res.redirect("/urls");
});

// login 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // lookup email in user Object 
  const findUser = findEmail(users, email);
  console.log(findUser);
  if (!findUser) {
    return res.status(403).send('Email cannot be found');
  }

  if (password !== findUser.password) {
    return res.status(403).send('Password do not match');
  }

  res.cookie('user_id', findUser.id);
  res.redirect('/urls');
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "") {
    return res.status(400).send('Email not written');
  } else if (password === '') {
    return res.status(400).send('Password not written');
  }
  const emailLookup = findEmail(users, email)
  if (emailLookup) {
    return res.status(400).send('Email already exist');
  }

  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  return res.redirect('/urls');

});


// render to registration page 
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_register", templateVars);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
})