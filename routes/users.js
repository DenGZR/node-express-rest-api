import express from 'express'
import { HttpError, AuthError, DBError } from '../error'
import jsonwebtoken from 'jsonwebtoken'
import { verifyToken, getTokenPayload } from '../middleware/token'
import async from 'async'
import CONFIG from '../config/config.json'
const TOKEN_SECRET = CONFIG.token.secret

import User from '../models/user'

export const usersRoutes = express.Router();
// req.header(field)

usersRoutes.get('/', (req, res, next) => {
  // req.header('Authorization')
  return next( new DBError(455,'kbkj', 'test'))
  console.log('1');

}, (req, res, next) => {
  res.send('User Info');
});


usersRoutes.get('/me', verifyToken, (req, res, next) => {

  async.waterfall([
    function(callback) {
      const { email } = req.decoded
      console.log('email',email);
      callback(null,email)
    },
    function(email,callback) {
      User.findOne({email: email}, callback);
    },
    function(user, callback) {
      if (user) {
        res.status(200).json({
          id: user._id,
          phone: user.phone,
          email: user.email,
          name: user.name
        })
      } else {
        console.log('user dont Unauthorized');
        callback(new AuthError( 401, "Unauthorized"));
      }
    }
  ], (error,result) =>{
    if (error) {
      return next(error)
    }
    next()
  });
})

usersRoutes.post('/login', (req, res, next) => {
  const reqUserData = {
     email : req.body.email,
     password : req.body.password
  }

  User.authorize(reqUserData.email, reqUserData.password, function(error, user) {
    if (error) {
      return next(error);
    }
    // if user is found and password is right
    // create a token
    var token = jsonwebtoken.sign({ email: user.email }, TOKEN_SECRET)
    // return the information including token as JSON
    res.status(200).json({ token: token })
  })
})

usersRoutes.post('/register', (req, res, next) => {
  const reqUserData = {
     name : req.body.name,
     email : req.body.email,
     phone : req.body.phone,
     password : req.body.password
  }

  async.waterfall([
    function(callback) {
      User.findOne({email: reqUserData.email}, callback);
    },
    function(user, callback) {
      if (user) {
        callback(new AuthError(409, 'User with the email \'' + req.body.email + '\' already exists.', 'email'))
      } else {
        const user = new User(reqUserData);
        console.log("new user create success", user);
        callback(null, user)
      }
    },
    function(user, callback) {
      user.save(function(error) {
        if (error) {
          console.log("new user save Error", error);
          return next(new DBError(500, error.message))
        }
        const token = jsonwebtoken.sign({ email : user.email }, TOKEN_SECRET)
        console.log('create token', token );
        // return the information including token as JSON
        res.status(200).json({ token: token })
      });
    }
  ], (error,result) =>{
    console.log(error,result);
    if (error) {
      return next(error)
    }
    next()
  })
})
