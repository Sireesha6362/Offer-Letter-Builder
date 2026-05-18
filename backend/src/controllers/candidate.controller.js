const db = require('../config/db');

// POST /api/candidates
const createCandidate = async (req, res) => {
  try {
    const { full_name, email, phone, designation, department, source } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ message: 'Full name and email are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const [existing] = await db.query('SELECT id FROM candidates WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Candidate email already exists.' });
    }

    const [result] = await db.query(
      'INSERT INTO candidates (full_name, email, phone, designation, department, source) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, phone || null, designation || null, department || null, source || null]
    );

    res.status(201).json({ message: 'Candidate created.', candidateId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/candidates
const getCandidates = async (req, res) => {
  try {
    const { search, department } = req.query;
    let query = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    query += ' ORDER BY created_at DESC';
    const [candidates] = await db.query(query, params);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/candidates/:id
const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const [candidates] = await db.query('SELECT * FROM candidates WHERE id = ?', [id]);
    if (candidates.length === 0) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }
    res.json(candidates[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { createCandidate, getCandidates, getCandidateById };