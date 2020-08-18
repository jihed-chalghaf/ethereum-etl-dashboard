const User = require('../models/user.model.js').User;
const jwt = require ('jsonwebtoken');
const bcrypt = require ('bcryptjs');
// plug in env variables
require('dotenv').config();

// unless
var unless = require('express-unless');

const {loginValidation}= require ('../models/validation.js');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

// we'll put here all the invalidated tokens, we'll need a way to clean up the old tokens
let blackListedTokens = [];

// function which will be called to clean our blackListedTokens array of elements that surpassed 40 mins
// a good way to use it is by calling it in the authenticateJWT function :]
// which means on every request that needs authentication, we'll update/clean our blacklist
function cleanBlackList() {
    if (blackListedTokens.length > 0) {
      // keep only the tokens that didn't surpass 40 mins since their push time
      blackListedTokens = blackListedTokens.filter(element => (Date.now() - JSON.parse(element)["push_time"]) < 4800000);
    }
  }
  
function token_exists(black_list, token) {
    let exist = false;
    black_list.forEach(token_entry => {
      console.log("###EQUALS### ??? => " + String(JSON.parse(token_entry)["token"]).localeCompare(String(token)));
      if (String(JSON.parse(token_entry)["token"]).localeCompare(String(token)) == 0) {
        exist = true;
        return exist;
      }
    });
    return exist;
}
  
  
// Express middleware that handles the authentication process
const authenticateJWT = (req, res, next) => {
    console.log("##Starting authenticateJWT##");
    cleanBlackList();
    const authHeader = req.headers.authorization;
    console.log("authHeader ==> ", authHeader);
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // if the token entered is black-listed, we deny the user's requests
      if (blackListedTokens.length > 0 && token_exists(blackListedTokens, token)) {
        return res.status(403).json({ error: 'Bad request , token is no longer valid' });
      }
  
      jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
          return res.status(403).json(err);
        }
        // assign the full verified user that we got back from our verify fct
        req.user = user;
        console.log("req.user ==> ", user);
        console.log("req.user.role ==> ", req.user.role);
        next();
      });
    } else {
      res.sendStatus(401);
    }
};
  
authenticateJWT.unless = unless;

// export the function in order to access it through the controller
exports.authenticateJWT = authenticateJWT;

// login a user using his credentials (email, password)
exports.login = async (req, res) => {
    // Validation of the data before adding a user
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    // Making sure the email exists
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email or password is wrong');
    // Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Invalid password');

    // Create and assign a token that expires after 40 mins
    const token = jwt.sign(
        {id: user._id, role: user.role},
        accessTokenSecret,
        { expiresIn: '24h' } 
    );
   // res.header('auth-token',token).send(token);
    res.status(200).json({ user: user.transform(), token: token });
};

// logout a user
exports.logout = async (req, res) => {
    console.log('================ Logout')

    // two ways to logout: 
    // 1- user will logout before token expiry, in this case we'll come here and invalidate his token this way
    // 2- token expires => we'll log him out from the frontend, we won't contact the server in this case
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // on logout, we'll put the user's token in a blacklist, so that he won't be able to use it again
      const token_entry = JSON.stringify({ "token": token, "push_time": Date.now() });
      blackListedTokens.push(token_entry);
      console.log("###LOGOUT - BlackListedTokens### => " + blackListedTokens);
    }
  
    return res.status(200).json({ result: "Logout successful" });
};