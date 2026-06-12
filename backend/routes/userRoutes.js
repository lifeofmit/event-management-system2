const express = require('express');
const router = express.Router();
const { getUsers, createUser, assignCoordinator } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All user management routes are strictly for Super Admin
router.use(protect, authorize('SUPER_ADMIN'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.post('/assign', assignCoordinator);

module.exports = router;