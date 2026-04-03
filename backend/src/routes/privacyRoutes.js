const express = require('express');
const router = express.Router();
const {
  requestDeletion,
  confirmDeletion,
} = require('../controllers/privacyController');

router.post('/deletion-request', requestDeletion);
router.post('/confirm-deletion', confirmDeletion);

module.exports = router;
