const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    
    res.json("");
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
