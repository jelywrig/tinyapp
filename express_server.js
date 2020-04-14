const express = require('express');
const bodyParser = require('body-parser');
const cookieParser= require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if(!longURL) {
    res.statusCode = 404;
    res.send('link not found');
  } else { 
    res.redirect(longURL);
  }
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = 'http://' + req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/update', (req,res) => {
  const shortURL = req.params.shortURL;
  if(urlDatabase[shortURL]) {
    urlDatabase[shortURL] = 'http://' + req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.statusCode = 404;
    res.send('url not in database');
  }

});
app.post('/urls/:shortURL/delete', (req, res) =>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {  
    username: req.cookies.username
  };
  res.render('users_registration', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req,res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies.username
  };
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) =>{
  const templateVars = {  
    username: req.cookies.username
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render('urls_show', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}`);
});



//Helper functions

function generateRandomString(length) {
  {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');;
 }
}

