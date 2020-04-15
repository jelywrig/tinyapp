const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const {getUserIdByEmail, generateRandomString,getUrlsForUser} = require('./helpers');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

//***************setup ********************
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'sdflkji390982304jkllsjdfe9vc2nmsvl9371',
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));
app.set('view engine', 'ejs');

//**********temp data ****************
const urlDatabase = {
  'b2xVn2': {
    longURL:'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID'
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

//*************Routes*************/
//home

app.get('/', (req, res) => {
  const userID = req.session.user_id;
  if(!userID || !users[userID]) {
    res.redirect('./login')
  } else  {
    res.redirect('./urls');
  }
});

//registration

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('must provide email and password');
  } else if (getUserIdByEmail(req.body.email, users)) {
    res.status(400).send('This email is already registered');
  } else {
    const newUser = {
      id: generateRandomString(6),
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password,10)
    };
    users[newUser.id] = newUser;
    req.session.user_id = newUser.id;
    res.redirect('/urls');
    
  }
  
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if(!templateVars.user) {
    res.render('users_registration', templateVars);
  } else {
    res.redirect('/urls');
  }
  
});


//login & logout

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if(!templateVars.user) {
    res.render('users_login', templateVars);
  } else {
    res.redirect('/urls');
  }
  
});


app.post('/login', (req, res) => {
  let userId = getUserIdByEmail(req.body.email, users);

  if (!userId) {
    res.status(403).send('No user with that email: <a href="/register">register</a>');
  } else if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
    res.status(403).send('Incorrect password: <a href="/login">login</a>');
  } else {
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//follow shortlink

app.get('/u/:shortURL', (req, res) => {
  const URL = urlDatabase[req.params.shortURL];
  const longURL = URL.longURL;
  if (!URL) {
    res.statusCode = 404;
    res.send('link not found');
  } else {
    res.redirect(longURL);
  }
});

//urls page


app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL.includes('http') ? req.body.longURL : 'http://' + req.body.longURL,
    userID: userId
  };
  res.redirect(`/urls/${shortURL}`);
});

// ***** Disabled ******
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.get('/urls', (req,res) => {
  const templateVars = {
    urls: getUrlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  
  if (!templateVars.user) {
    res.send('Please login or register in order to access your URLs\n<a href="/login">Login</a> <a href="Register">Register</a>');
  } else {
    res.render('urls_index', templateVars);
  }
  
});


// individual urls

app.get('/urls/new', (req, res) =>{
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL/update', (req,res) => {
  const shortURL = req.params.shortURL;
  
  if (!urlDatabase[shortURL]) {
    res.status(404).send('url not in database');
  } else if (! (req.session.user_id === urlDatabase[shortURL].userID)) {
    res.status(403).send('Can not update URL that you do not own');
  } else {
    urlDatabase[shortURL].longURL = 'http://' + req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }

});
app.post('/urls/:shortURL/delete', (req, res) =>{
  const shortURL = req.params.shortURL;
  if (! (req.session.user_id === urlDatabase[shortURL].userID)) {
    res.status(403).send('Can not delete URL you do not own');
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }

});

app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('That URL code does not exist\n<a href="/urls">URLs<a>');
  } else if (!(urlDatabase[req.params.shortURL].userID === req.session.user_id)) {
    res.status(403).send('That URL does not belong to the currently logged in user <a href="/urls">URLs<a>');
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      url: urlDatabase[req.params.shortURL],
      user: users[req.session.user_id]
    };
    res.render('urls_show', templateVars);
  }
});


//  get server listening
app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}`);
});




