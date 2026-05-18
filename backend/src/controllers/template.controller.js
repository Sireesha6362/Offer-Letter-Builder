const db = require('../config/db');

// POST /api/templates
const createTemplate = async (req, res) => {
  try {
    const { name, body_html } = req.body;
    const created_by = req.user.id;

    if (!name || !body_html) {
      return res.status(400).json({ message: 'Template name and body are required.' });
    }

    const [existing] = await db.query(
      'SELECT id FROM templates WHERE name = ? AND is_active = 1',
      [name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Template name already exists.' });
    }

    const placeholderRegex = /{{[a-zA-Z_]+}}/g;
    const foundPlaceholders = body_html.match(placeholderRegex) || [];

    await db.query(
      'INSERT INTO templates (name, body_html, placeholders_json, version, created_by, is_active) VALUES (?, ?, ?, 1, ?, 1)',
      [name, body_html, JSON.stringify(foundPlaceholders), created_by]
    );

    res.status(201).json({ message: 'Template created.', placeholders: foundPlaceholders });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/templates
const getTemplates = async (req, res) => {
  try {
    const [templates] = await db.query(
      'SELECT * FROM templates WHERE is_active = 1 ORDER BY created_at DESC'
    );
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/templates/:id
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const [templates] = await db.query(
      'SELECT * FROM templates WHERE id = ? AND is_active = 1', [id]
    );
    if (templates.length === 0) {
      return res.status(404).json({ message: 'Template not found.' });
    }
    res.json(templates[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PUT /api/templates/:id
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, body_html } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM templates WHERE id = ? AND is_active = 1', [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Template not found.' });
    }

    const newVersion = existing[0].version + 1;
    const placeholderRegex = /{{[a-zA-Z_]+}}/g;
    const foundPlaceholders = body_html.match(placeholderRegex) || [];

    await db.query(
      'UPDATE templates SET name = ?, body_html = ?, placeholders_json = ?, version = ? WHERE id = ?',
      [name, body_html, JSON.stringify(foundPlaceholders), newVersion, id]
    );

    res.json({ message: 'Template updated.', version: newVersion });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// DELETE /api/templates/:id
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE templates SET is_active = 0 WHERE id = ?', [id]);
    res.json({ message: 'Template deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate };