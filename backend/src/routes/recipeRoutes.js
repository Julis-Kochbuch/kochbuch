import express from 'express';

import { requireAuth } from '../src/utils.js';
import recipeController from '../controllers/recipeController.js';

const router = express.Router();

router.route('/').get(requireAuth(0), recipeController.allRecipesGet);
router.route('/').post(requireAuth(0), recipeController.newRecipePost);

router.route('/categories').get(requireAuth(0), recipeController.categoriesGet);
router.route('/categories').post(requireAuth(0), recipeController.newCategoryPost);

router.route('/categories/:id').delete(requireAuth(0), recipeController.categoryDelete);
router.route('/categories/:id').post(requireAuth(0), recipeController.categoryPost);

router.route('/:id').delete(requireAuth(0), recipeController.recipeDelete);
router.route('/:id').get(requireAuth(0), recipeController.recipeGet);
router.route('/:id').post(requireAuth(0), recipeController.recipePost);

router.route('/:id/share').get(requireAuth(0), recipeController.recipeShareGet);
router.route('/:id/share').post(requireAuth(0), recipeController.recipeSharePost);

export default router;