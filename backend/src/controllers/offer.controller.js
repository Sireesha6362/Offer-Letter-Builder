const db = require('../config/db');

// Helper: substitute {{placeholders}} in HTML
const substitutePlaceholders = (html, data) => {
  return html.replace(/{{(\w+)}}/g, (match, key) => {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      throw new Error(`Missing value for placeholder: {{${key}}}`);
    }
    return data[key];
  });
};

// POST /api/offers
const generateOffer = async (req, res) => {
  try {
    const { candidate_id, template_id, salary, joining_date } = req.body;

    if (!candidate_id || !template_id || !salary || !joining_date) {
      return res.status(400).json({ message: 'candidate_id, template_id, salary and joining_date are required.' });
    }

    if (isNaN(salary) || Number(salary) <= 0) {
      return res.status(400).json({ message: 'Salary must be a positive number.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const joiningDate = new Date(joining_date);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (joiningDate < tomorrow) {
      return res.status(400).json({ message: 'Joining date must be at least tomorrow.' });
    }

    const [candidates] = await db.query('SELECT * FROM candidates WHERE id = ?', [candidate_id]);
    if (candidates.length === 0) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }
    const candidate = candidates[0];

    const [templates] = await db.query(
      'SELECT * FROM templates WHERE id = ? AND is_active = 1', [template_id]
    );
    if (templates.length === 0) {
      return res.status(404).json({ message: 'Template not found.' });
    }
    const template = templates[0];

    const placeholderData = {
      name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone || '',
      designation: candidate.designation || '',
      department: candidate.department || '',
      salary: salary,
      doj: joining_date,
      joining_date: joining_date,
    };

    let generatedHtml;
    try {
      generatedHtml = substitutePlaceholders(template.body_html, placeholderData);
    } catch (placeholderErr) {
      return res.status(400).json({ message: placeholderErr.message });
    }

    const [result] = await db.query(
      'INSERT INTO offers (candidate_id, template_id, salary, joining_date, generated_html, status, current_version) VALUES (?, ?, ?, ?, ?, "Draft", 1)',
      [candidate_id, template_id, salary, joining_date, generatedHtml]
    );

    const offerId = result.insertId;

    await db.query(
      'INSERT INTO offer_versions (offer_id, version, html_snapshot, edited_by, change_note) VALUES (?, 1, ?, ?, "Initial generation")',
      [offerId, generatedHtml, req.user.id]
    );

    res.status(201).json({ message: 'Offer generated.', offerId, generatedHtml });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/offers
const getOffers = async (req, res) => {
  try {
    const [offers] = await db.query(
      `SELECT o.*, c.full_name, c.email as candidate_email, t.name as template_name 
       FROM offers o 
       JOIN candidates c ON o.candidate_id = c.id 
       JOIN templates t ON o.template_id = t.id 
       ORDER BY o.created_at DESC`
    );
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/offers/:id
const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const [offers] = await db.query(
      `SELECT o.*, c.full_name, c.email as candidate_email, t.name as template_name 
       FROM offers o 
       JOIN candidates c ON o.candidate_id = c.id 
       JOIN templates t ON o.template_id = t.id 
       WHERE o.id = ?`,
      [id]
    );
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Offer not found.' });
    }
    res.json(offers[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PUT /api/offers/:id
const editOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { generated_html, change_note } = req.body;

    const [offers] = await db.query('SELECT * FROM offers WHERE id = ?', [id]);
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Offer not found.' });
    }
    const offer = offers[0];

    if (offer.status === 'Accepted') {
      return res.status(403).json({ message: 'Accepted offers cannot be edited.' });
    }

    const newVersion = offer.current_version + 1;

    await db.query(
      'UPDATE offers SET generated_html = ?, current_version = ? WHERE id = ?',
      [generated_html, newVersion, id]
    );

    await db.query(
      'INSERT INTO offer_versions (offer_id, version, html_snapshot, edited_by, change_note) VALUES (?, ?, ?, ?, ?)',
      [id, newVersion, generated_html, req.user.id, change_note || 'Manual edit']
    );

    res.json({ message: 'Offer updated.', version: newVersion });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/offers/:id/history
const getOfferHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [versions] = await db.query(
      'SELECT * FROM offer_versions WHERE offer_id = ? ORDER BY version ASC',
      [id]
    );
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH /api/offers/:id/status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const validStatuses = ['Draft', 'Sent', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const [offers] = await db.query('SELECT * FROM offers WHERE id = ?', [id]);
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Offer not found.' });
    }
    const offer = offers[0];

    const allowedTransitions = {
      Draft: ['Sent'],
      Sent: ['Accepted', 'Rejected'],
      Accepted: [],
      Rejected: [],
    };

    const isAdmin = req.user.role === 'Admin';
    if (!allowedTransitions[offer.status].includes(status) && !isAdmin) {
      return res.status(400).json({
        message: `Cannot move from "${offer.status}" to "${status}".`
      });
    }

    await db.query('UPDATE offers SET status = ? WHERE id = ?', [status, id]);

    await db.query(
      'INSERT INTO offer_status_log (offer_id, from_status, to_status, changed_by, remark) VALUES (?, ?, ?, ?, ?)',
      [id, offer.status, status, req.user.id, remark || null]
    );

    res.json({ message: `Status updated to "${status}".` });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/offers/dashboard
const getDashboard = async (req, res) => {
  try {
    const [counts] = await db.query(
      `SELECT 
        SUM(status = 'Draft') as drafts,
        SUM(status = 'Sent') as sent,
        SUM(status = 'Accepted') as accepted,
        SUM(status = 'Rejected') as rejected
       FROM offers`
    );
    const [recent] = await db.query(
      `SELECT o.*, c.full_name FROM offers o 
       JOIN candidates c ON o.candidate_id = c.id 
       ORDER BY o.created_at DESC LIMIT 5`
    );
    res.json({ counts: counts[0], recentActivity: recent });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/offers/:id/pdf
const downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const [offers] = await db.query('SELECT * FROM offers WHERE id = ?', [id]);
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    const puppeteer = require('puppeteer-core');
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(offers[0].generated_html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
      printBackground: true,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=offer_${id}.pdf`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ message: 'PDF generation failed.', error: err.message });
  }
};

module.exports = { generateOffer, getOffers, getOfferById, editOffer, getOfferHistory, updateStatus, getDashboard, downloadPDF };