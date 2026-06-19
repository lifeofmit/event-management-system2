const express = require('express');
const router = express.Router();
const { getUsers, createUser, assignCoordinator, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Base path: /api/users
router.use(protect); // All routes require a valid token login

// GET and POST operations (Strictly Super Admin)
router.route('/')
  .get(authorize('SUPER_ADMIN'), getUsers)
  .post(authorize('SUPER_ADMIN'), createUser);

// Coordinator Assignment shortcut route
router.post('/assign', authorize('SUPER_ADMIN'), assignCoordinator);

// PUT operation for updates (Allows Super Admin to modify anyone, or any user to modify self)
router.route('/:id')
  .put(updateUser);

module.exports = router;