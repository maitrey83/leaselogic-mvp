/**
 * Templates API
 * Task 3.7: Notice Templates
 *
 * Endpoints:
 * - POST   /api/templates        - Save new template
 * - GET    /api/templates        - List user's templates
 * - GET    /api/templates/:id    - Get single template (increments usage_count)
 * - PUT    /api/templates/:id    - Update template
 * - DELETE /api/templates/:id    - Delete template
 */

const { supabaseAdmin } = require('../config/supabase');

/**
 * Save new template
 * POST /api/templates
 */
async function saveTemplate(req, res) {
  try {
    const { template_name, document_type, template_data, property_id } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!template_name || !document_type || !template_data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: template_name, document_type, template_data'
      });
    }

    // Validate document_type
    const validDocumentTypes = ['utah-3day-notice', 'utah-rent-increase'];
    if (!validDocumentTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid document_type. Must be one of: ${validDocumentTypes.join(', ')}`
      });
    }

    // Validate template_data is not empty
    if (typeof template_data !== 'object' || Object.keys(template_data).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'template_data must be a non-empty object'
      });
    }

    // If property_id provided, verify it belongs to user
    if (property_id) {
      const { data: property, error: propertyError } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('id', property_id)
        .eq('user_id', user_id)
        .single();

      if (propertyError || !property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found or does not belong to user'
        });
      }
    }

    // Insert template
    const { data, error } = await supabaseAdmin
      .from('notice_templates')
      .insert({
        user_id,
        template_name,
        document_type,
        template_data,
        property_id: property_id || null
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (duplicate template name)
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'A template with this name already exists for this document type'
        });
      }

      console.error('Error saving template:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      template: data
    });

  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * List user's templates
 * GET /api/templates?document_type=utah-3day-notice
 */
async function listTemplates(req, res) {
  try {
    const user_id = req.user.id;
    const { document_type } = req.query;

    // Build query
    let query = supabaseAdmin
      .from('notice_templates')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    // Filter by document_type if provided
    if (document_type) {
      query = query.eq('document_type', document_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing templates:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      count: data.length,
      templates: data
    });

  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get single template
 * GET /api/templates/:id
 *
 * Note: This endpoint increments usage_count and updates last_used_at
 */
async function getTemplate(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Fetch template
    const { data, error } = await supabaseAdmin
      .from('notice_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Increment usage count and update last_used_at
    const { error: updateError } = await supabaseAdmin
      .from('notice_templates')
      .update({
        usage_count: data.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating usage count:', updateError);
      // Don't fail the request, just log the error
    }

    // Return template with updated usage_count for immediate display
    const updatedTemplate = {
      ...data,
      usage_count: data.usage_count + 1,
      last_used_at: new Date().toISOString()
    };

    res.json({
      success: true,
      template: updatedTemplate
    });

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Update template
 * PUT /api/templates/:id
 */
async function updateTemplate(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { template_name, template_data, property_id } = req.body;

    // Verify template exists and belongs to user
    const { data: existingTemplate, error: fetchError } = await supabaseAdmin
      .from('notice_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (fetchError || !existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Build update object (only update provided fields)
    const updates = {};

    if (template_name !== undefined) {
      updates.template_name = template_name;
    }

    if (template_data !== undefined) {
      // Validate template_data is not empty
      if (typeof template_data !== 'object' || Object.keys(template_data).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'template_data must be a non-empty object'
        });
      }
      updates.template_data = template_data;
    }

    if (property_id !== undefined) {
      // If property_id provided, verify it belongs to user
      if (property_id) {
        const { data: property, error: propertyError } = await supabaseAdmin
          .from('properties')
          .select('id')
          .eq('id', property_id)
          .eq('user_id', user_id)
          .single();

        if (propertyError || !property) {
          return res.status(404).json({
            success: false,
            error: 'Property not found or does not belong to user'
          });
        }
      }
      updates.property_id = property_id;
    }

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update template
    const { data, error } = await supabaseAdmin
      .from('notice_templates')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'A template with this name already exists for this document type'
        });
      }

      console.error('Error updating template:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      template: data
    });

  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Delete template
 * DELETE /api/templates/:id
 */
async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Delete template (RLS will ensure user owns it)
    const { data, error } = await supabaseAdmin
      .from('notice_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)
      .select();

    if (error) {
      console.error('Error deleting template:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = {
  saveTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate
};
