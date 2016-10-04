import path from 'path'
import util from 'util'
import http from 'http'

// ошибки для выдачи посетителю



export function HttpError(status, message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, HttpError);

  this.status = status;
  this.message = message || http.STATUS_CODES[status] || "Error";
}

util.inherits(HttpError, Error);
HttpError.prototype.name = 'HttpError';


export function AuthError(status, message, field) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.status = status;
  this.message = message;
  this.field = field;
}

util.inherits(AuthError, Error);
AuthError.prototype.name = 'AuthError';

export function DBError(status, message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, DBError);

  this.status = status;
  this.message = message;
}

util.inherits(DBError, Error);
DBError.prototype.name = 'DBError';
