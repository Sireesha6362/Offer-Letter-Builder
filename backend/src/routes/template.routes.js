const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate } = require('../controllers/template.controller');

router.post('/', protect, createTemplate);
router.get('/', protect, getTemplates);
router.get('/:id', protect, getTemplateById);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

module.exports = router;