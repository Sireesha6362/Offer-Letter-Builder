const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { generateOffer, getOffers, getOfferById, editOffer, getOfferHistory, updateStatus, getDashboard, downloadPDF } = require('../controllers/offer.controller');

router.get('/dashboard', protect, getDashboard);
router.post('/', protect, generateOffer);
router.get('/', protect, getOffers);
router.get('/:id/pdf', protect, downloadPDF);
router.get('/:id', protect, getOfferById);
router.put('/:id', protect, editOffer);
router.get('/:id/history', protect, getOfferHistory);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;