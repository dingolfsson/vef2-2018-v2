const express = require('express');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { check, validationResult } = require('express-validator/check');
const { Client } = require('pg');
const users = require('./users');
const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/postgres';
const xss = require('xss');
const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

async function insert(name, email, ssn, num) {
  const client = new Client({
    connectionString,
  });
  await client.connect();
  try {
    const query = 'INSERT INTO results(name, email, ssn, num) VALUES($1, $2, $3, $4);';
    const values = [xss(name), xss(email), xss(ssn), xss(num)];
    const res = await client.query(query, values);
  } catch (err) {
    console.error('Error selecting', err);
  }
  await client.end();
}

async function form(req, res) {
  // const loggedIn = await users.findByUsername('admin').then((b) => {
  //   if (b) return Object.entries(b)[3][1];
  //   return 'error';
  // });
  const usr = await users.findByUsername('admin').then((b) => {
    if (b) return Object.entries(b)[3][1];
    return 'bab';
  });
  const loggedIn = req.isAuthenticated();
  const data = {};
  return res.render('form', { data, loggedIn, usr });
}

router.get('/', form);

router.post(
  '/',
  check('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  check('email').isLength({ min: 1 }).withMessage('Netfang má ekki vera tómt'),
  check('email').isEmail().withMessage('Netfang verður að vera netfang'),
  check('ssn').isLength({ min: 1 }).withMessage('Kennitala má ekki vera tóm'),
  check('ssn').matches(/^[0-9]{6}-?[0-9]{4}$/).withMessage('Kennitala verður að vera á formi 000000-0000'),
  check('num').matches(/^[0-9]{1,}$/).withMessage('Verdur ad vera tala'),

  async (req, res) => {
    const {
      name = '',
      email = '',
      ssn = '',
      num = '',
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      return res.render('form', {
        errorMessages,
        name,
        email,
        ssn,
        num,
      });
    }
    await insert(xss(name), xss(email), xss(ssn), xss(num));
    return res.redirect('/success');
  },
);

router.get('/success', (req, res) => {
  res.render('success');
});

module.exports = router;
