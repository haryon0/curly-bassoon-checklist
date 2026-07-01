const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// GET /api/templates
const getTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, code, description, template_pdf_filename,
              (template_pdf_path IS NOT NULL) as has_pdf, is_active, created_at
       FROM checklist_templates
       WHERE is_active = true
       ORDER BY name ASC`
    );
    res.json({ templates: result.rows });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// GET /api/templates/:id
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, code, description, template_pdf_filename,
              (template_pdf_path IS NOT NULL) as has_pdf, is_active, created_at
       FROM checklist_templates WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ template: result.rows[0] });
  } catch (err) {
    console.error('Get template error:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

// GET /api/templates/:id/view  — streams the PDF (supports ?token= for iframe)
const viewTemplatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT template_pdf_path, template_pdf_filename FROM checklist_templates WHERE id = $1 AND is_active = true',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    const { template_pdf_path, template_pdf_filename } = result.rows[0];
    if (!template_pdf_path) {
      return res.status(404).json({ error: 'No PDF uploaded for this template' });
    }
    if (!fs.existsSync(template_pdf_path)) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${template_pdf_filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const stream = fs.createReadStream(template_pdf_path);
    stream.pipe(res);
  } catch (err) {
    console.error('View template PDF error:', err);
    res.status(500).json({ error: 'Failed to stream PDF' });
  }
};

// POST /api/templates/:id/upload-pdf  (admin only)
const uploadTemplatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Delete old PDF if exists
    const existing = await pool.query(
      'SELECT template_pdf_path FROM checklist_templates WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    const oldPath = existing.rows[0].template_pdf_path;
    if (oldPath && fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }

    await pool.query(
      `UPDATE checklist_templates
       SET template_pdf_filename = $1, template_pdf_path = $2, updated_at = NOW()
       WHERE id = $3`,
      [req.file.originalname, req.file.path, id]
    );

    res.json({ message: 'Template PDF uploaded successfully', filename: req.file.originalname });
  } catch (err) {
    console.error('Upload template PDF error:', err);
    res.status(500).json({ error: 'Failed to upload template PDF' });
  }
};

// POST /api/templates  (admin only)
const createTemplate = async (req, res) => {
  try {
    const { name, code, description, is_active } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    // Check if code already exists
    const existing = await pool.query(
      'SELECT id FROM checklist_templates WHERE code = $1',
      [code]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Template code already exists' });
    }

    const result = await pool.query(
      `INSERT INTO checklist_templates (name, code, description, template_pdf_filename, template_pdf_path, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, code, description, template_pdf_filename, is_active, created_at`,
      [name, code, description || null, req.file.originalname, req.file.path, is_active !== false]
    );

    res.status(201).json({
      message: 'Template created successfully',
      template: result.rows[0]
    });
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// PUT /api/templates/:id  (admin only)
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, is_active } = req.body;

    // Get existing template
    const existing = await pool.query(
      'SELECT template_pdf_path FROM checklist_templates WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    let templateFilename = null;
    let templatePath = null;

    // If new PDF uploaded, delete old and update
    if (req.file) {
      const oldPath = existing.rows[0].template_pdf_path;
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      templateFilename = req.file.originalname;
      templatePath = req.file.path;
    }

    // If code changed, check uniqueness
    if (code) {
      const codeCheck = await pool.query(
        'SELECT id FROM checklist_templates WHERE code = $1 AND id != $2',
        [code, id]
      );
      if (codeCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Template code already exists' });
      }
    }

    const updateQuery = `
      UPDATE checklist_templates
      SET
        name = COALESCE($2, name),
        code = COALESCE($3, code),
        description = COALESCE($4, description),
        ${req.file ? 'template_pdf_filename = $5, template_pdf_path = $6,' : ''}
        is_active = COALESCE($7, is_active),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, code, description, template_pdf_filename, is_active, updated_at
    `;

    const params = req.file
      ? [id, name, code, description, templateFilename, templatePath, is_active]
      : [id, name, code, description, is_active];

    const result = await pool.query(updateQuery, params);

    res.json({
      message: 'Template updated successfully',
      template: result.rows[0]
    });
  } catch (err) {
    console.error('Update template error:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// DELETE /api/templates/:id  (admin only)
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if template exists
    const existing = await pool.query(
      'SELECT template_pdf_path FROM checklist_templates WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if template is used in any checklist
    const used = await pool.query(
      'SELECT COUNT(*) as count FROM checklists WHERE template_id = $1',
      [id]
    );
    if (used.rows[0].count > 0) {
      return res.status(409).json({
        error: `Cannot delete template. It is used in ${used.rows[0].count} checklist(s).`
      });
    }

    // Delete PDF file if exists
    const pdfPath = existing.rows[0].template_pdf_path;
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    // Delete template
    await pool.query('DELETE FROM checklist_templates WHERE id = $1', [id]);

    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error('Delete template error:', err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

module.exports = { getTemplates, getTemplateById, viewTemplatePdf, uploadTemplatePdf, createTemplate, updateTemplate, deleteTemplate };
