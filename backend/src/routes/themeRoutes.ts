import express from 'express';

import { requireAuth } from '../utils/requireAuth.js';
import themeController from '../controllers/themeController.js';

const router = express.Router();

router.route('/').get(requireAuth(0), themeController.themesListGet);

router.route('/:slug').post(requireAuth(10), themeController.themePost);

export default router;