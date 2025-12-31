const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Scalable E-Commerce Backend - API OK' });
});

module.exports = router;
