/**
 * Templates Routes
 * Task 3.7: Notice Templates
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  saveTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate
} = require('../api/templates');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Routes
router.post('/', saveTemplate);           // Save new template
router.get('/', listTemplates);           // List user's templates
router.get('/:id', getTemplate);          // Get single template (increments usage)
router.put('/:id', updateTemplate);       // Update template
router.delete('/:id', deleteTemplate);    // Delete template

module.exports = router;
