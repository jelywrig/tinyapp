const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const {getUserIdByEmail, generateRandomString,getUrlsForUser, getUniqueVisitors} = require('./helpers');
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
    userID: 'userRandomID',
    visits: []
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID',
    visits:[]
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
  const templateVars = {user: undefined};
  if (!req.body.email || !req.body.password) {
    templateVars.message = 'Must provide email and password when registering. <a href="./register">Register</a>';
    res.status(400).render('error', templateVars);
  } else if (getUserIdByEmail(req.body.email, users)) {
    templateVars.message = 'This email is already registered. Please <a href="./login">login</a>.'
    res.status(400).render('error', templateVars);
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
  const templateVars = {user: users[userId]};
  if (!userId) {
    templateVars.message = 'No user with that email: <a href="/register">register</a>';
    res.status(403).render('error', templateVars);
  } else if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
    templateVars.message = 'Incorrect password: <a href="/login">login</a>'
    res.status(403).render('error', templateVars);
  } else {
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = undefined;
  res.redirect('/urls');
});

//follow shortlink

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const URL = urlDatabase[shortURL];
  const longURL = URL.longURL;
  if (!URL) {
    res.statusCode = 404;
    res.send('link not found');
  } else {
    //check for visitor id, assign one if not present
    let visitorID = undefined;
    if(req.session.visitor_id) {
      visitorID = req.session.visitor_id;
    } else {
      visitorID = generateRandomString(6);
      req.session.visitor_id = visitorID;
    }
    //add visit to url in URL db
    urlDatabase[shortURL].visits.push({visitorID, datetime: new Date()});
    res.redirect(longURL);
  }
});

//urls page


app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL.includes('http') ? req.body.longURL : 'http://' + req.body.longURL,
    userID: userId,
    visits: []
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
    templateVars.message = 'Please <a href="/login">login</a> or <a href="register">register</a> in order to access your URLs';
    res.render('error', templateVars);
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
  
  //can only happen via curl etc so don't render error page, just send error text
  if (!urlDatabase[shortURL]) {
    res.status(404).send('url not in database');
  } else if (! (req.session.user_id === urlDatabase[shortURL].userID)) {
    res.status(403).send('Can not update URL that you do not own');
  } else {
    urlDatabase[shortURL].longURL = 'http://' + req.body.longURL;
    urlDatabase[shortURL].visits = [];
    res.redirect(`/urls/${shortURL}`);
  }

});
app.post('/urls/:shortURL/delete', (req, res) =>{
  const shortURL = req.params.shortURL;
  //can only happen via curl etc so don't render error page, just send error text
  if (! (req.session.user_id === urlDatabase[shortURL].userID)) {
    res.status(403).send('Can not delete URL you do not own');
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }

});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id],
    url: urlDatabase[req.params.shortURL],
    shortURL: req.params.shortURL
  };
  if (!templateVars.url) {
    templateVars.message = 'That URL code does not exist\n<a href="/urls">URLs<a>';
    res.status(404).render('error', templateVars);
  } else if (templateVars.url.userID !== req.session.user_id) {
    templateVars.message = 'That URL does not belong to the currently logged in user <a href="/urls">URLs<a>';
    res.status(403).render('error', templateVars);
  } else {
  templateVars.uniqueVisitors = getUniqueVisitors(urlDatabase[req.params.shortURL]);
    res.render('urls_show', templateVars);
  }
});


//  get server listening
app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}`);
});




