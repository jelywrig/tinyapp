const {
  getUserIdByEmail,
  generateRandomString,
  getUrlsForUser
} = require('../helpers');
const { assert }= require('chai');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    password: 'dishwasher-funk'
  }
};

const testUrlDatabase = {
  'b2xVn2': {
    longURL:'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID2'
  }
};


describe('getUserIdByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserIdByEmail('user@example.com', testUsers)
    const expectedOutput = 'userRandomID';
    assert.equal(user,expectedOutput);
  });

  it('should return undefined for invalid email', () => {
    const user = getUserIdByEmail('user@nope.com', testUsers)
    const expectedOutput = undefined;
    assert.equal(user,expectedOutput);

  });
});

describe('getUrlsForUser', ()=> {
 it('should return 1 entry for userRandomID', () => {
  const expectedOutput = {'b2xVn2': {
    longURL:'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  }};
  assert.deepEqual(getUrlsForUser('userRandomID', testUrlDatabase), expectedOutput);
 });
 it('should return empty object for userRandomID3', () => {
  assert.deepEqual(getUrlsForUser('userRandomID3', testUrlDatabase), {});
 });

});

describe('generateRandomString', () => {
  
  it('should return a string',() => {
    assert.equal(typeof generateRandomString(6), 'string');
  });
  
  it('should return string of the length passed to it', () => {
    const length = 7;
    assert.equal(generateRandomString(length).length, length);
  });

  it('should return a different value for a second call',() => {
    assert.notEqual(generateRandomString(5), generateRandomString(5));
  });
});