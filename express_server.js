const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req,res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) =>{
  res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}`);
});



//Helper functions

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

console.log(generateRandomString());
console.log(generateRandomString());
console.log(generateRandomString());
console.log(generateRandomString());
console.log(generateRandomString());