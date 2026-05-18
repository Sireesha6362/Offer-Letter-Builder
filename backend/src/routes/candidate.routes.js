const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createCandidate, getCandidates, getCandidateById } = require('../controllers/candidate.controller');

router.post('/', protect, createCandidate);
router.get('/', protect, getCandidates);
router.get('/:id', protect, getCandidateById);

module.exports = router;