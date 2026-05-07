import express from 'express';
import { getProfile, updateProfile, uploadProfilePicture, getStats } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/picture', upload.single('avatar'), uploadProfilePicture);
router.get('/stats', getStats);

export default router;
