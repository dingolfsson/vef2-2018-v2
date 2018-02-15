const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const users = require('./users');
const client = require('pg')

const router = express.Router();

async function login(req, res) {
    const data = {};
    return res.render('login', { data });
}
async function admin(req, res) {
  const data = {};
  return res.render('admin', { data });
}

 router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('ensureLogged')
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
router.get('/admin', admin)

router.post(
    '/',
    passport.authenticate('local', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      res.render('admin');
    },
);

router.get('/admin', (req, res) => {
  console.log('admin /admin')
  if (req.isAuthenticated()) {
    console.log('get admin')
    return res.send('hello');
  }

  return res.send(`
    <p><a href="/login">Innskráning</a></p>
  `);
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
