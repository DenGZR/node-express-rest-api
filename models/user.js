import mongoose from 'mongoose'
import crypto from 'crypto'
import async from 'async'
import { AuthError } from '../error'
const Schema = mongoose.Schema



var schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};


schema.statics.authorize = function(email, password, callback) {
  const User = this;
  console.log('email',email);
  console.log('password',password);

  async.waterfall([
    function(callback) {
      console.log('try find user');
      User.findOne({email: email}, callback);
    },
    function(user, callback) {
      if (user) {
        console.log('user is finded', user);
        if (user.checkPassword(password)) {

          callback(null, user);
        } else {
          callback(new AuthError( 422, "Wrong email are password", "password" ));
        }
      } else {
        console.log('user dont finded');
        callback(new AuthError( 409, "Wrong email or user not found", "email" ));
      }
    }
  ], callback);
};

export default mongoose.model('User', schema, 'users');
