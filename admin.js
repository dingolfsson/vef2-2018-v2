const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const users = require('./users');
const { Client } = require('pg');
const xss = require('xss');
const Papa = require('papaparse');
const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/postgres';

const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

async function getData(req, res) {
  const client = new Client({ connectionString });
  
  await client.connect();
  // try {
    const data = await client.query('SELECT id, date, name, email, ssn, num FROM results;');
    const bdata = data.rows;
  // } catch (err) {
  //   console.error('Error selecting', err);
  // }
  await client.end();
  return res.render('admin', { bdata });
}

async function getMoreData(res, req) {
  const client = new Client({ connectionString });
  
  await client.connect();
  try {
    const data = await client.query('SELECT id, date, name, email, ssn, num FROM results;');
    const testt = await Papa.unparse(data.rows, {
      delimiter: ';'
    });
    return testt;
  } catch (err) {
    console.log(err)
  }
  await client.end();
  
  return ;
}


router.get('/', ensureLoggedIn, getData);

router.get('/download', async (req, res) => {
  const filename = 'data.csv';
  res.set('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(await getMoreData());
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
