/**
 * State Configurations Index
 * Imports and registers all state configurations
 */

import stateRegistry from '../stateRegistry';
import utah from './utah';

// Register all states
stateRegistry.register(utah);

export {
  utah
};

export default stateRegistry;
