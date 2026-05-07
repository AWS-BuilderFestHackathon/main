import express from 'express';
import { generateBackground } from '../controllers/backgroundController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

router.post('/generate', generateBackground);

export default router;
