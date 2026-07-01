const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadTemplate } = require('../middleware/upload');
const {
  getTemplates,
  getTemplateById,
  viewTemplatePdf,
  uploadTemplatePdf,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/templatesController');

router.get('/', authenticateToken, getTemplates);
router.get('/:id', authenticateToken, getTemplateById);
router.get('/:id/view', authenticateToken, viewTemplatePdf);
router.post('/', authenticateToken, requireAdmin, uploadTemplate.single('pdf'), createTemplate);
router.put('/:id', authenticateToken, requireAdmin, uploadTemplate.single('pdf'), updateTemplate);
router.delete('/:id', authenticateToken, requireAdmin, deleteTemplate);
router.post('/:id/upload-pdf', authenticateToken, requireAdmin, uploadTemplate.single('pdf'), uploadTemplatePdf);

module.exports = router;
