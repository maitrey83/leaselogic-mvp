/**
 * Services Module
 * Main entry point for all services
 */

import documentService from './DocumentService';
import validationService from './ValidationService';
import templateService from './TemplateService';

export {
  documentService,
  validationService,
  templateService
};

export default {
  documents: documentService,
  validation: validationService,
  templates: templateService
};
