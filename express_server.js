const express = require("express");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const findUserByEmail = require("./helpers")
const { request } = require("express");
const { render } = require("ejs");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['iAMaKEyyyyyyyyyy', 'IaMTheSecondKey'],

  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//Helper function 
// const findUserByEmail = (database, email) => {
//   for (const user in database) {

//     if (database[user].email === email) {
//       return database[user];
//     }
//   }
//   return undefined;
// }

function isUserLoggedIn(userId) {
  if (userId) {
    let userInDatabase = users[userId];
    if (userInDatabase) {
      return true;
    }
  }
  return false;
}

function doesUserOwnUrl(userId, shortURL) {
  if (urlDatabase[shortURL].user_id === userId) {
    return true;
  }
  return false;
}

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "38jd48"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: "9sd4u3"
  },
  "urlLong": {
    longURL: "https://pomofocus.io/app",
    user_id: "2fw44e"
  },
  "shire": {
    longURL: 'https://www.facebook.com/',
    user_id: "user2RandomID"
  },
  "isurfshfg": {
    longURL: 'https://web.compass.lighthouselabs.ca/days/today',
    user_id: "87ybe6"
  },
  "foo": {
    longURL: "http://ryan.com",
    user_id: "user2RandomID"

  },
  "bar": {
    longURL: "http://bar.com",
    user_id: "userRandomID"
  }
};



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


//Hello Page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Hello Page w/ Greeting 
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World' };
  res.render("hello_world", templateVars);
});

//Get MyURLS page
app.get("/urls", (req, res) => {
  const urls = {};
  for (const url in urlDatabase) {

    if (req.session.user_id === urlDatabase[url].user_id) {
      urls[url] = urlDatabase[url];
    }
  }

  const templateVars = {
    urls: urls,
    user: users[req.session["user_id"]]
  }
  res.render("urls_index", templateVars);
});

//Get to Create New URL
app.get("/urls/new", (req, res) => {
  let templateVars = {};
  let cookieUserId = req.session["user_id"];
  if (!isUserLoggedIn(cookieUserId)) {
    templateVars = {
      user: cookieUserId,
      error: "You need to login first!",
    }
    res.render('urls_login', templateVars);
  } else {
    templateVars = {
      user: users[cookieUserId],
    }
    res.render("urls_new", templateVars);
  }
});

//Get to LongUrl from ShortUrl
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("shortURL not found");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//ShortURL created
app.get("/urls/new/:id", (req, res) => {
  res.render("urls_new");
});



// Post Generating New ShortUrl to LongUrl 
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = {
    user_id: req.session["user_id"],
    longURL
  };

  let templateVars = { user: users[req.session["user_id"]] };
  if (!templateVars.user) {
    templateVars = {
      user: users[req.session["user_id"]],
      error: "You need to login first!"
    }
    res.status(401).send('You need to login first!');
  } else {
    res.redirect(`/urls/${shortUrl}`);
  }
});


//Showpage
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]]
  };
  if (!isUserLoggedIn(req.session["user_id"])) {
    templateVars = {
      user: users[req.session["user_id"]],
      error: "You need to login first!"
    }
    res.render('urls_login', templateVars);
  } else {
    res.render("urls_show", templateVars);
  }
});

// Post Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]]
  };
  if (!isUserLoggedIn(req.session["user_id"])) {
    templateVars = {
      user: users[req.session["user_id"]],
      error: "You need to login first!"
    }
    res.status(401).send(templateVars.error);
  } else {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  }

});

// Post edit Long Url 
app.post("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]]
  };

  if (!isUserLoggedIn(req.session["user_id"])) {
    templateVars = {
      user: users[req.session["user_id"]],
      error: "You need to login first!"
    }
    res.status(401).send(templateVars.error);
  } else if (!doesUserOwnUrl(templateVars.user, templateVars.shortURL)) {
    templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session["user_id"]],
      error: "User does not own url"
    }
    res.status(403).send(templateVars.error);
  } else {
    const shortUrl = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortUrl] = longURL;
    res.redirect("/urls");
  }
});

// Post /login 
app.post("/login", (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;
  const user = findUserByEmail(req.body.email, users);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {

    res.status(403).send('Email cannot be found');

  }
});

// Post /register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return res.status(400).send('Email not written');
  } else if (!password) {
    return res.status(400).send('Password not written');
  }

  const emailLookup = findUserByEmail(email, users);
  if (emailLookup) {
    return res.status(400).send('Email already exist');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  users[userId] = { id: userId, email, password: hashedPassword };

  // res.cookie('user_id', emailLookup.user);
  req.session.user_id = userId;
  // res.cookie('user_id', id);
  res.redirect('/urls');

});


//Registration page 
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };

  res.render("urls_register", templateVars);
});

//Logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
})

//Go Login Page
app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };

  res.render("urls_login", templateVars);
})