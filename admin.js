const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const users = require('./users');

const router = express.Router();

async function login(req, res) {
    const data = {};
    return res.render('login', { data });
 }

 router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

router.get('/login', (req, res) => {
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

  return res.redirect('/login');
}

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

router.use(passport.initialize());
router.use(passport.session())

router.get('/', login)

router.post(
    '/',
    passport.authenticate('local', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      res.redirect('/admin');
    },
);

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
