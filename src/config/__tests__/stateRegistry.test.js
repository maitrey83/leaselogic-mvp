import { StateRegistry } from '../stateRegistry';

describe('StateRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new StateRegistry();
  });

  test('registers a state', () => {
    const state = {
      code: 'UT',
      name: 'Utah',
      active: true
    };

    registry.register(state);
    expect(registry.hasState('UT')).toBe(true);
  });

  test('throws error when registering state without code', () => {
    const state = { name: 'Utah' };
    expect(() => registry.register(state)).toThrow('State must have a code');
  });

  test('gets state by code', () => {
    const state = {
      code: 'UT',
      name: 'Utah',
      active: true
    };

    registry.register(state);
    const retrieved = registry.getState('UT');
    expect(retrieved.code).toBe('UT');
    expect(retrieved.name).toBe('Utah');
  });

  test('throws error when getting non-existent state', () => {
    expect(() => registry.getState('XX')).toThrow('State not found');
  });

  test('gets only active states', () => {
    registry.register({ code: 'UT', name: 'Utah', active: true });
    registry.register({ code: 'CA', name: 'California', active: false });
    registry.register({ code: 'TX', name: 'Texas', active: true });

    const activeStates = registry.getActiveStates();
    expect(activeStates).toHaveLength(2);
    expect(activeStates.every(state => state.active === true)).toBe(true);
  });

  test('gets all states', () => {
    registry.register({ code: 'UT', name: 'Utah', active: true });
    registry.register({ code: 'CA', name: 'California', active: false });

    const allStates = registry.getAllStates();
    expect(allStates).toHaveLength(2);
  });

  test('checks if state exists', () => {
    registry.register({ code: 'UT', name: 'Utah', active: true });

    expect(registry.hasState('UT')).toBe(true);
    expect(registry.hasState('XX')).toBe(false);
  });

  test('checks if state is active', () => {
    registry.register({ code: 'UT', name: 'Utah', active: true });
    registry.register({ code: 'CA', name: 'California', active: false });

    expect(registry.isStateActive('UT')).toBe(true);
    expect(registry.isStateActive('CA')).toBe(false);
    expect(registry.isStateActive('XX')).toBe(false);
  });
});
