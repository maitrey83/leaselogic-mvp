/**
 * Document Definitions Index
 * Imports and registers all document definitions
 */

import documentRegistry from '../documentRegistry';
import utah3DayNotice from './utah-3day-notice';
import utahRentIncrease from './utah-rent-increase';

// Register all documents
documentRegistry.register(utah3DayNotice);
documentRegistry.register(utahRentIncrease);

export {
  utah3DayNotice,
  utahRentIncrease
};

export default documentRegistry;
