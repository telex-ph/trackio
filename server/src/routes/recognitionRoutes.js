import express from 'express';
import { recognitionController } from '../controllers/recognitionController.js';

const router = express.Router();

// Public routes
router.get('/', recognitionController.getRecognitions);
router.get('/:id', recognitionController.getRecognitionById);
router.get('/employees/search', recognitionController.searchEmployees);

// Protected routes
router.post('/', recognitionController.createRecognition);
router.put('/:id', recognitionController.updateRecognition);
router.patch('/:id/archive', recognitionController.toggleArchive);
router.delete('/:id', recognitionController.deleteRecognition);
router.patch('/:id/like', recognitionController.toggleLike);

export default router;