import express from 'express';

import { requireAuth } from '../src/utils.js';
import userController from '../controllers/userController.js';

const router = express.Router();

router.route('/').get(requireAuth(10), userController.allUsersGet);
router.route('/').post(requireAuth(10), userController.newUserPost);

router.route('/share').get(requireAuth(0), userController.innerApiKeysGet);

router.route('/me').get(requireAuth(0), userController.meGet);
router.route('/me').post(requireAuth(0), userController.mePost);

router.route('/theme').get(requireAuth(0), userController.themesListGet);
router.route('/theme').post(requireAuth(0), userController.themePost);

router.route('/:id').delete(requireAuth(10), userController.userDelete);
router.route('/:id').post(requireAuth(10), userController.userPost);

export default router;