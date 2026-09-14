import express from 'express';

import { requireAuth } from '../src/utils.js';
import uploadsController from '../controllers/uploadsController.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.route('/recipe/:id').post(requireAuth(0), upload.array("images"), uploadsController.uploadRecipeImage);

router.route('/recipe/:recipe_id/:image_name').get(requireAuth(0), uploadsController.recipeImageGet);

router.route('/theme/:theme_slug/:file_name').get(uploadsController.themeFileGet);

export default router;