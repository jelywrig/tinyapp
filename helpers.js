
const getUserIdByEmail = function(email, users) {

  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }

  return '';
}

const generateRandomString = function(length) {
  {
    let result           = [];
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
  }
}

const getUrlsForUser = function(id, urlDatabase) {
  const result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }

  return result;
}


module.exports = {
  getUserIdByEmail,
  generateRandomString,
  getUrlsForUser
};