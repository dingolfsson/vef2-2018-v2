const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const passport = require('passport');
const { Strategy } = require('passport-local');
const form = require('./form');
const admin = require('./admin');
const users = require('./users')

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const sessionSecret = 'leyndarmál';

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

app.use('/', form);
app.use('/login', admin);
//app.use('/admin', admin);

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.send(`
      <p>Innskráning sem ${req.user.username}</p>
      <p><a href="/logout">Útskráning</a></p>
      <p><a href="/admin">Skoða leyndarmál</a></p>
    `);
  }

  return res.send(`
    <p><a href="/login">Innskráning</a></p>
  `);
});

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('app ensure')
  return res.redirect('/login');
}

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).render('error', { title: '404' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  res.status(500).render('error', { err });
}

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});