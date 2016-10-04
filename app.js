import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cors from 'cors'
import logger from 'morgan'
import tokenMiddleware from './middleware/token'
import CONFIG from './config/config.json'
import debug from 'debug'
import { HttpError, AuthError, DBError } from './error'

const app = express()
const PORT = parseInt(CONFIG.server.port, 10)
const HOST_NAME = CONFIG.server.hostName
const DATABASE_NAME = CONFIG.database.name

// routes
import { usersRoutes } from './routes/users'

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
// Allow requests from any origin
app.use(cors({ origin: '*' }))

mongoose.connect('mongodb://' + HOST_NAME + '/' + DATABASE_NAME);

app.use('/api', usersRoutes);
// app.use('/api/events', eventsRoutes);
// app.use('/api/tickets', ticketsRoutes);

app.use(function(err, req, res, next) {

  if (typeof err == 'number') {
    console.log('err == number');
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
         message: err.message
       })
  }
  if (err instanceof AuthError) {
    return res.status(err.status).json({
         field: err.field,
         message: err.message
       })
  }
  if (err instanceof DBError) {
    return res.status(err.status).json({
         message: 'DBError'
       })
  }
  // need add advance logger
  console.log(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const server = app.listen(PORT, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});
