const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadPhotos } = require('../middleware/upload');
const {
  submitChecklist,
  getMyChecklists,
  getChecklistById,
  deleteChecklist,
  downloadChecklist,
  getStats,
} = require('../controllers/checklistController');

router.get('/stats', authenticateToken, getStats);
router.get('/my', authenticateToken, getMyChecklists);
router.get('/:id', authenticateToken, getChecklistById);
router.get('/:id/download', authenticateToken, downloadChecklist);
router.post('/submit', authenticateToken, uploadPhotos.array('photos', 20), submitChecklist);
router.delete('/:id', authenticateToken, deleteChecklist);

module.exports = router;
