const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const users = require('./users');
const app = express();

const router = express.Router();
const sessionSecret = 'leyndarmál';

app.use(passport.initialize());
app.use(passport.session());

function strat(username, password, done) {
    users
      .findByUsername(username)
      .then((username) => {
        if (!username) {
          return done(null, false);
        }
  
        return users.comparePasswords(password, username);
      })
      .then(res => done(null, res))
      .catch((err) => {
        done(err, 'villa');
      })
};

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

async function login(req, res) {
    const data = {};
    return res.render('login', { data });
 }

 router.post('/', 
  (req, res) => {
    const {
      username = '',
      password = '',
    } = req.body;
    strat(username, password);
    console.log(users.findByUsername(username))
    console.log(username + ' ' + password);
});

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

router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

function ensureLoggedIn(req, res, next) {
    
    if (req.isAuthenticated()) {
      return next();
    }
  
    return res.redirect('/error');
  }

  app.get('/login', (req, res) => {
    
});

router.get('/', login);

router.post(
    '/login',
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

router.get('/login', ensureLoggedIn, (req, res) => {
    res.render('admin');
});



module.exports = router;
