/**
 * State Registry
 * Manages all state configurations in the system
 */

class StateRegistry {
  constructor() {
    this.states = new Map();
  }

  /**
   * Register a state configuration
   */
  register(state) {
    if (!state.code) {
      throw new Error('State must have a code');
    }
    this.states.set(state.code, state);
  }

  /**
   * Get state by code
   */
  getState(code) {
    const state = this.states.get(code);
    if (!state) {
      throw new Error(`State not found: ${code}`);
    }
    return state;
  }

  /**
   * Get all active states
   */
  getActiveStates() {
    return Array.from(this.states.values())
      .filter(state => state.active === true);
  }

  /**
   * Get all states
   */
  getAllStates() {
    return Array.from(this.states.values());
  }

  /**
   * Check if state exists
   */
  hasState(code) {
    return this.states.has(code);
  }

  /**
   * Check if state is active
   */
  isStateActive(code) {
    const state = this.states.get(code);
    return state?.active === true;
  }
}

// Create singleton instance
const registry = new StateRegistry();

export default registry;
export { StateRegistry };
