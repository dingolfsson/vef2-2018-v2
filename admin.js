const express = require('express');
const { Client } = require('pg');
const Papa = require('papaparse');

const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/postgres';

const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

async function getData() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const data = await client.query('SELECT id, date, name, email, ssn, num FROM results');
    await client.end();
    return data.rows;
  } catch (err) {
    console.info(err);
  }
  return 'ERROR';
}

router.get('/', ensureLoggedIn, async (req, res) => {
  const data = await getData();
  res.render('admin', { data });
});

router.get('/download', ensureLoggedIn, async (req, res) => {
  const tmp = await getData();
  try {
    const data = Papa.unparse(tmp, {
      delimiter: ';',
    });
    const filename = 'data.csv';
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  } catch (err) {
    console.info(err);
    res.send('error');
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
