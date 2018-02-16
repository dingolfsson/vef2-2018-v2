
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet')
const passport = require('passport');
const { Strategy } = require('passport-local');
const form = require('./form');
const admin = require('./admin');
const users = require('./users')

const app = express();

//app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const sessionSecret = 'leyndarmál';

app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser(sessionSecret));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));


function strat(username, password, done) {
  users
    .findByUsername(username)
    .then((user) => {
      if (!user) {
        return done(null, false);
      }

      return users.comparePasswords(password, user);
    })
    .then(res => done(null, res))
    .catch((err) => {
      done(err);
    });
}

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  users
    .findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});

app.use(passport.initialize());
app.use(passport.session())

app.use('/', form);
app.use('/admin', admin);

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }

  next();
});


app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }
  const data = {};
  return res.render('login', { data });
});

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
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
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});