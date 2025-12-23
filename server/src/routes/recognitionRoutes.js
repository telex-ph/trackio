import express from 'express';
import { recognitionController } from '../controllers/recognitionController.js';

const router = express.Router();

router.get('/', recognitionController.getRecognitions);
router.get('/:id', recognitionController.getRecognitionById);
router.get('/employees/search', recognitionController.searchEmployees);
router.get('/employee/:employeeId', recognitionController.getRecognitionByEmployeeId);

router.post('/', recognitionController.createRecognition);
router.put('/:id', recognitionController.updateRecognition);
router.patch('/:id/archive', recognitionController.toggleArchive);
router.delete('/:id', recognitionController.deleteRecognition);


export default router;

