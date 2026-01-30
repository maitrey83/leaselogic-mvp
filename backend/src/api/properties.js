/**
 * Properties API
 * Task 3.5 - Property Management
 *
 * Provides CRUD operations for user properties with:
 * - User isolation via RLS
 * - Full-text search
 * - Validation
 * - Audit trail (automatic via triggers)
 */

const { supabaseAdmin } = require('../config/supabase');

/**
 * Create a new property
 * POST /api/properties
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function createProperty(req, res) {
  try {
    const {
      property_name,
      street_address,
      unit_number,
      city,
      state,
      zip_code,
      property_type,
      notes
    } = req.body;

    // Get authenticated user ID
    const user_id = req.user.id;

    // Validate required fields
    if (!street_address || !city || !state || !zip_code) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['street_address', 'city', 'state', 'zip_code']
      });
    }

    // Validate zip code format (5 digits)
    if (!/^\d{5}$/.test(zip_code)) {
      return res.status(400).json({
        error: 'Invalid zip code format',
        message: 'Zip code must be 5 digits'
      });
    }

    // Validate property type if provided
    const validPropertyTypes = ['single-family', 'apartment', 'condo', 'townhouse', 'other'];
    if (property_type && !validPropertyTypes.includes(property_type)) {
      return res.status(400).json({
        error: 'Invalid property type',
        valid_types: validPropertyTypes
      });
    }

    // Create property
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id,
        property_name,
        street_address,
        unit_number,
        city,
        state: state || 'UT',
        zip_code,
        property_type,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('[Properties API] Create error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('[Properties API] Create exception:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
}

/**
 * List all properties for authenticated user
 * GET /api/properties
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function listProperties(req, res) {
  try {
    const user_id = req.user.id;

    // Query user's properties (RLS will enforce user isolation)
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Properties API] List error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('[Properties API] List exception:', error);
    res.status(500).json({ error: 'Failed to list properties' });
  }
}

/**
 * Get a single property by ID
 * GET /api/properties/:id
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function getProperty(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Query property (RLS will ensure user can only access their own)
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      console.error('[Properties API] Get error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('[Properties API] Get exception:', error);
    res.status(500).json({ error: 'Failed to get property' });
  }
}

/**
 * Update a property
 * PUT /api/properties/:id
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const {
      property_name,
      street_address,
      unit_number,
      city,
      state,
      zip_code,
      property_type,
      notes
    } = req.body;

    // Validate zip code if provided
    if (zip_code && !/^\d{5}$/.test(zip_code)) {
      return res.status(400).json({
        error: 'Invalid zip code format',
        message: 'Zip code must be 5 digits'
      });
    }

    // Validate property type if provided
    const validPropertyTypes = ['single-family', 'apartment', 'condo', 'townhouse', 'other'];
    if (property_type && !validPropertyTypes.includes(property_type)) {
      return res.status(400).json({
        error: 'Invalid property type',
        valid_types: validPropertyTypes
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};
    if (property_name !== undefined) updateData.property_name = property_name;
    if (street_address !== undefined) updateData.street_address = street_address;
    if (unit_number !== undefined) updateData.unit_number = unit_number;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip_code !== undefined) updateData.zip_code = zip_code;
    if (property_type !== undefined) updateData.property_type = property_type;
    if (notes !== undefined) updateData.notes = notes;

    // Update property (RLS will ensure user can only update their own)
    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      console.error('[Properties API] Update error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('[Properties API] Update exception:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
}

/**
 * Delete a property
 * DELETE /api/properties/:id
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function deleteProperty(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Delete property (RLS will ensure user can only delete their own)
    const { data, error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      console.error('[Properties API] Delete error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Property deleted successfully', property: data });
  } catch (error) {
    console.error('[Properties API] Delete exception:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
}

/**
 * Search properties using full-text search
 * GET /api/properties/search?q=query
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function searchProperties(req, res) {
  try {
    const { q } = req.query;
    const user_id = req.user.id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Search query required',
        message: 'Please provide a search query parameter: ?q=query'
      });
    }

    // Use PostgreSQL full-text search
    // The search_vector column is automatically updated by triggers
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('user_id', user_id)
      .textSearch('search_vector', q, {
        type: 'websearch',
        config: 'english'
      })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Properties API] Search error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('[Properties API] Search exception:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
}

module.exports = {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties
};
