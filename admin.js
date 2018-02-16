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

async function admin(req, res) {
  var data = [];
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    database: 'postgres',
    password: 'postgres',
  });
  
  await client.connect();
  try {
    const data = await client.query({
      rowMode: 'array',
      text: 'SELECT * FROM postgres'
    });
  } catch (err) {
    console.error('Error selecting', err);
  }
  await client.end();
  console.log(res)
  return res.render('admin');
}

router.get('/', (req, res) => {
  res.render('admin', {admin});
})

// router.post(
//     '/', admin
// );

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
