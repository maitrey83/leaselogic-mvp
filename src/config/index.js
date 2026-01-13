/**
 * Configuration Module
 * Main entry point for all configuration
 */

import documentRegistry from './documents';
import stateRegistry from './states';

export {
  documentRegistry,
  stateRegistry
};

export default {
  documents: documentRegistry,
  states: stateRegistry
};
