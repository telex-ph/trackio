import express from 'express';
import { recognitionController } from '../controllers/recognitionController.js';

const router = express.Router();

// Add authentication middleware if you have one
// import { authenticate, authorize } from '../middleware/auth.js';

// GET routes
router.get('/', recognitionController.getRecognitions);
router.get('/me', recognitionController.getMyRecognitions); // NEW: Get current user's recognitions
router.get('/:id', recognitionController.getRecognitionById);
router.get('/employees/search', recognitionController.searchEmployees);
router.get('/employee/:employeeId', recognitionController.getRecognitionByEmployeeId);

// Certificate routes
router.post('/generate-certificate', recognitionController.generateCertificate);
router.get('/certificate/:recognitionId', recognitionController.getCertificate);

// POST, PUT, PATCH, DELETE routes (admin/managers only)
router.post('/', recognitionController.createRecognition);
router.put('/:id', recognitionController.updateRecognition);
router.patch('/:id/archive', recognitionController.toggleArchive);
router.delete('/:id', recognitionController.deleteRecognition);

export default router;