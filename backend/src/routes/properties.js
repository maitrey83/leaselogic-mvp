/**
 * Properties Routes
 * Task 3.5 - Property Management
 *
 * Defines Express routes for property CRUD operations
 * All routes require authentication
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties
} = require('../api/properties');

/**
 * All property routes require authentication
 */

/**
 * @route   POST /api/properties
 * @desc    Create a new property
 * @access  Private
 */
router.post('/', authenticateUser, createProperty);

/**
 * @route   GET /api/properties
 * @desc    List all properties for authenticated user
 * @access  Private
 */
router.get('/', authenticateUser, listProperties);

/**
 * @route   GET /api/properties/search
 * @desc    Search properties using full-text search
 * @access  Private
 * @query   q - Search query string
 *
 * NOTE: This route must come before /:id to avoid conflicts
 */
router.get('/search', authenticateUser, searchProperties);

/**
 * @route   GET /api/properties/:id
 * @desc    Get a single property by ID
 * @access  Private
 */
router.get('/:id', authenticateUser, getProperty);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update a property
 * @access  Private
 */
router.put('/:id', authenticateUser, updateProperty);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete a property
 * @access  Private
 */
router.delete('/:id', authenticateUser, deleteProperty);

module.exports = router;
