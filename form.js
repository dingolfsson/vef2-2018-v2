const express = require('express');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { check, validationResult } = require('express-validator/check');
const { Client } = require('pg');
const connectionString = 'postgres://:@localhost/postgres';

const router = express.Router();

async function insert(name, email, ssn, num) {
  const client = new Client({
    connectionString,
  });
  await client.connect();
  try {
    const query = 'INSERT INTO results(name, email, ssn, num) VALUES($1, $2, $3, $4);';
    const values = [name, email, ssn, num];
    const res = await client.query(query, values);
  } catch (err) {
    console.error('Error selecting', err);
  }
  await client.end();
}

async function select() {
  const client = new Client({
    connectionString,
  });
  await client.connect();
  try {
    const query = 'SELECT * FROM results;';
    const res = await client.query(query);
    console.log(res.rows);
  } catch (err) {
    console.error('Error selecting', err);
  }
  await client.end();
}

async function form(req, res) {
  console.log(req.body)
  const data = {};
  return res.render('form', { data });
}

router.get('/', form);

router.post('/', 
  check('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  check('email').isLength({ min: 1}).withMessage('Netfang má ekki vera tómt'),
  check('email').isEmail().withMessage('Netfang verður að vera netfang'),
  check('ssn').isLength({ min: 1 }).withMessage('Kennitala má ekki vera tóm'),
  check('ssn').matches(/^[0-9]{6}-?[0-9]{4}$/).withMessage('Kennitala verður að vera á formi 000000-0000'),

  (req, res) => {
    const {
      name = '',
      email = '',
      ssn = '',
      num = '',
    } = req.body;
    
    const errors = validationResult(req);

    console.log(errors.isEmpty())
  
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      return res.render('form', { errorMessages });
    }
    insert(name, email, ssn, num);
    return res.redirect('/success');
});

router.get('/success', (req, res) => {
  res.render('success', { select });
})

module.exports = router;
