const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');

const initMongoDb = require('./lib/init-mongodb');

const index = require('./routes/index');
const users = require('./routes/users');
const auth = require('./routes/auth');

const strategy = require('./lib/passport-strategy');

const User = require('./model/User');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'awesome secret',
  saveUninitialized: true,
  resave: false,
  cookie: { maxAge: 60 * 1000 * 15 }
})); // 15 minutes
app.use(passport.initialize());
app.use(passport.session());
//
passport.use(strategy);
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  console.log('deserializeUser', id);
  User.findOne({ _id: id }, done);
});

const promise = initMongoDb(app).then(() => {
  app.use('/auth', auth);
  app.use('/', passport.authenticate('custom', { failureRedirect: '/auth/login' }), express.static(path.join(__dirname, 'private')));
  app.use('/users', passport.authenticate('custom', { failureRedirect: '/auth/login' }), users);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
});

module.exports = promise;
