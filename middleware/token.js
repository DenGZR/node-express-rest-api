import jsonwebtoken from 'jsonwebtoken'
import CONFIG from '../config/config.json'
import { HttpError, AuthError } from '../error'
const TOKEN_SECRET = CONFIG.token.secret

// route middleware to verify a token
export function verifyToken(req, res, next) {

  // check header or for token
  const token = req.header('Authorization')
  console.log('token',token);
  // decode token
  if (token) {
      var decoded = jsonwebtoken.decode(token);
      if (!decoded) {
        console.log('Error decoded token');
        next(new AuthError( 401, "Error verify token"))
      } else {
        // if everything is good, save to request for use in other routes
        console.log('decoded good',decoded);
        req.decoded = decoded;
        next();
      }
  } else {
    // if there is no token
    // return an error
    next(new AuthError( 401, "No token provided."))
  }
}

export function getTokenPayload(req) {
  let payload = null;

  // check header or url parameters or post parameters for token
  const token = req.header('Authorization')

  if (token) {
    payload = jsonwebtoken.decode(token, { complete: true }).payload;
  }

  return payload;
}
