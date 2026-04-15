const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/adminUserController');

// @route   GET /api/admin/users
router.get('/', getUsers);

// @route   POST /api/admin/users
router.post('/', createUser);

// @route   PUT /api/admin/users/:id
router.put('/:id', updateUser);

// @route   DELETE /api/admin/users/:id
router.delete('/:id', deleteUser);

module.exports = router;
