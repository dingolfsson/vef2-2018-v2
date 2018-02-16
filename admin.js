const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const users = require('./users');
const { Client } = require('pg');
const xss = require('xss');
//const connectionString = 'postgres://:@localhost/postgres';

const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

async function getData(req, res) {
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    database: 'postgres',
    password: 'postgres',
  });
  
  await client.connect();
  // try {
    const data = await client.query('SELECT id, date, name, email, ssn, num FROM results');
    const bdata = data.rows;
  // } catch (err) {
  //   console.error('Error selecting', err);
  // }
  await client.end();
  console.log(bdata);
  return res.render('admin', { bdata });
}

// async function select() {
//   await client.connect();
//   try {
//     const res = await Client.query('SELECT * FROM texts');
//     console.log(res.rows);
//   } catch (e) {
//     console.error('Error selecting', e);
//   }

//   await Client.end();
// }

router.get('/', ensureLoggedIn, getData)

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
