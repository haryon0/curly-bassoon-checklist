const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { generateChecklistPdf } = require('../services/pdfService');

// POST /api/checklist/submit
const submitChecklist = async (req, res) => {
  const client = await pool.connect();
  const uploadedFiles = req.files || [];

  try {
    await client.query('BEGIN');

    const { template_id, title, location, notes } = req.body;
    const captions     = req.body.captions     ? JSON.parse(req.body.captions)     : {};
    const annotations  = req.body.annotations  ? JSON.parse(req.body.annotations)  : {};

    if (!template_id || !title) {
      return res.status(400).json({ error: 'template_id and title are required' });
    }

    // Get template info
    const templateResult = await client.query(
      'SELECT id, name, code, template_pdf_path FROM checklist_templates WHERE id = $1 AND is_active = true',
      [template_id]
    );
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    const template = templateResult.rows[0];

    // Create checklist record (status: processing)
    const checklistResult = await client.query(
      `INSERT INTO checklists (user_id, template_id, title, location, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'processing')
       RETURNING id`,
      [req.user.id, template_id, title, location || null, notes || null]
    );
    const checklistId = checklistResult.rows[0].id;

    // Insert photos
    const photos = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const caption = captions[i] || captions[String(i)] || '';

      await client.query(
        `INSERT INTO checklist_photos
           (checklist_id, photo_filename, photo_path, photo_caption, photo_order, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [checklistId, file.filename, file.path, caption, i, file.size, file.mimetype]
      );

      photos.push({ path: file.path, caption });
    }

    // Generate PDF
    const outputFilename = `checklist_${checklistId}_${uuidv4()}.pdf`;
    const outputPath = path.join(process.env.GENERATED_DIR || 'generated', outputFilename);

    const { size } = await generateChecklistPdf({
      templatePath: template.template_pdf_path,
      photos,
      annotations,
      submissionData: {
        title,
        location: location || '',
        notes: notes || '',
        templateName: template.name,
        templateCode: template.code,
        fullName: req.user.full_name,
        username: req.user.username,
        submittedAt: new Date(),
      },
      outputPath,
    });

    // Update checklist with PDF info
    await client.query(
      `UPDATE checklists
       SET result_pdf_filename = $1, result_pdf_path = $2, result_pdf_size = $3,
           status = 'completed', updated_at = NOW()
       WHERE id = $4`,
      [outputFilename, outputPath, size, checklistId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Checklist submitted and PDF generated successfully',
      checklist_id: checklistId,
      pdf_filename: outputFilename,
      pdf_size: size,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Submit checklist error:', err);

    // Clean up uploaded files on error
    uploadedFiles.forEach((f) => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });

    res.status(500).json({ error: 'Failed to submit checklist: ' + err.message });
  } finally {
    client.release();
  }
};

// GET /api/checklist/my
const getMyChecklists = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM checklists WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.id, c.title, c.location, c.status, c.result_pdf_size,
              c.created_at, c.updated_at,
              t.name as template_name, t.code as template_code,
              (SELECT COUNT(*) FROM checklist_photos WHERE checklist_id = c.id) as photo_count
       FROM checklists c
       LEFT JOIN checklist_templates t ON c.template_id = t.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      checklists: result.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get checklists error:', err);
    res.status(500).json({ error: 'Failed to fetch checklists' });
  }
};

// GET /api/checklist/:id
const getChecklistById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.title, c.location, c.notes, c.status,
              c.result_pdf_filename, c.result_pdf_size, c.created_at,
              t.name as template_name, t.code as template_code,
              u.full_name, u.username
       FROM checklists c
       LEFT JOIN checklist_templates t ON c.template_id = t.id
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    const photos = await pool.query(
      `SELECT id, photo_filename, photo_caption, photo_order, file_size
       FROM checklist_photos WHERE checklist_id = $1 ORDER BY photo_order`,
      [id]
    );

    res.json({ checklist: result.rows[0], photos: photos.rows });
  } catch (err) {
    console.error('Get checklist error:', err);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
};

// DELETE /api/checklist/:id
const deleteChecklist = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // Get checklist (must belong to user)
    const result = await client.query(
      'SELECT id, result_pdf_path FROM checklists WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    const checklist = result.rows[0];

    // Get photos for file cleanup
    const photosResult = await client.query(
      'SELECT photo_path FROM checklist_photos WHERE checklist_id = $1',
      [id]
    );

    // Delete from DB (cascades to photos)
    await client.query('DELETE FROM checklists WHERE id = $1', [id]);
    await client.query('COMMIT');

    // Clean up files
    photosResult.rows.forEach(({ photo_path }) => {
      if (photo_path && fs.existsSync(photo_path)) fs.unlinkSync(photo_path);
    });
    if (checklist.result_pdf_path && fs.existsSync(checklist.result_pdf_path)) {
      fs.unlinkSync(checklist.result_pdf_path);
    }

    res.json({ message: 'Checklist deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete checklist error:', err);
    res.status(500).json({ error: 'Failed to delete checklist' });
  } finally {
    client.release();
  }
};

// GET /api/checklist/:id/download
const downloadChecklist = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT result_pdf_path, result_pdf_filename, status FROM checklists WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    const { result_pdf_path, result_pdf_filename, status } = result.rows[0];
    if (status !== 'completed' || !result_pdf_path) {
      return res.status(400).json({ error: 'PDF not yet generated' });
    }
    if (!fs.existsSync(result_pdf_path)) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result_pdf_filename}"`);

    const stream = fs.createReadStream(result_pdf_path);
    stream.pipe(res);
  } catch (err) {
    console.error('Download checklist error:', err);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
};

// GET /api/checklist/stats (dashboard)
const getStats = async (req, res) => {
  try {
    const statsResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'completed') as completed,
         COUNT(*) FILTER (WHERE status = 'processing') as processing,
         COUNT(*) as total,
         COUNT(DISTINCT DATE(created_at)) as active_days
       FROM checklists WHERE user_id = $1`,
      [req.user.id]
    );

    const recentResult = await pool.query(
      `SELECT c.id, c.title, c.location, c.status, c.created_at,
              t.name as template_name, t.code as template_code,
              (SELECT COUNT(*) FROM checklist_photos WHERE checklist_id = c.id) as photo_count
       FROM checklists c
       LEFT JOIN checklist_templates t ON c.template_id = t.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC LIMIT 5`,
      [req.user.id]
    );

    res.json({ stats: statsResult.rows[0], recent: recentResult.rows });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { submitChecklist, getMyChecklists, getChecklistById, deleteChecklist, downloadChecklist, getStats };
