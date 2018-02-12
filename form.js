const express = require('express');

const router = express.Router();

function form(req, res) {
  const data = {};
  res.render('form', { data });
}

//router.get('/', form);

router.get('/', (req, res) => {
 res.send(`
 <form method="post" action="/post">
  <input type="text" name="Nafn">
  <input type="text" name="Netfang">
  <input type="text" name="Kennitala">
  <input type="text" name="Fjoldi">
  <button>Senda</button>
</form>
 `);
})

router.get('/post', (reg, res) => {
  res.send('test');
})

module.exports = router;
