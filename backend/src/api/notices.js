const { supabaseAdmin } = require('../config/supabase');
const PdfGenerator = require('../services/PdfGenerator');
const TemplateEngine = require('../services/TemplateEngine');

/**
 * Subtask 3.6.2: Create Notice Metadata Storage
 * POST /api/notices - Store notice metadata (NO PDF storage)
 */
async function createNotice(req, res) {
  try {
    const { document_type, notice_type, form_data, property_id, payment_id } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!document_type || !notice_type || !form_data) {
      return res.status(400).json({
        error: 'document_type, notice_type, and form_data are required'
      });
    }

    // Validate form_data completeness
    if (!form_data || Object.keys(form_data).length === 0) {
      return res.status(400).json({
        error: 'form_data must contain form field values for PDF regeneration'
      });
    }

    // Validate document_type
    const validDocTypes = ['utah-3day-notice', 'utah-rent-increase'];
    if (!validDocTypes.includes(document_type)) {
      return res.status(400).json({
        error: `Invalid document_type. Must be one of: ${validDocTypes.join(', ')}`
      });
    }

    // Validate notice_type
    const validNoticeTypes = ['preview', 'final'];
    if (!validNoticeTypes.includes(notice_type)) {
      return res.status(400).json({
        error: `Invalid notice_type. Must be one of: ${validNoticeTypes.join(', ')}`
      });
    }

    // Subtask 3.6.4: Verify property ownership if property_id provided
    if (property_id) {
      const { data: property, error: propError } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('id', property_id)
        .eq('user_id', user_id)
        .single();

      if (propError || !property) {
        return res.status(404).json({
          error: 'Property not found or does not belong to user'
        });
      }
    }

    // Subtask 3.6.5: Verify payment if payment_id provided
    // Note: payments table will be created in Phase 4
    // For now, we allow payment_id to be stored but don't verify it
    if (payment_id && notice_type === 'final') {
      // TODO: Verify payment in Phase 4 when payments table exists
      // const { data: payment } = await supabaseAdmin
      //   .from('payments')
      //   .select('id, status')
      //   .eq('id', payment_id)
      //   .eq('user_id', user_id)
      //   .single();
      //
      // if (!payment || payment.status !== 'completed') {
      //   return res.status(400).json({
      //     error: 'Invalid or incomplete payment'
      //   });
      // }
    }

    // Store metadata only (NO PDF generation or storage)
    const { data: notice, error } = await supabaseAdmin
      .from('notices')
      .insert({
        user_id,
        property_id: property_id || null,
        payment_id: payment_id || null,
        document_type,
        notice_type,
        form_data // Store complete form state for on-demand regeneration
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notice:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      notice
    });

  } catch (error) {
    console.error('Error in createNotice:', error);
    res.status(500).json({
      error: error.message || 'Failed to create notice'
    });
  }
}

/**
 * Subtask 3.6.7: List User's Notices
 * GET /api/notices - List all notices for authenticated user
 */
async function listNotices(req, res) {
  try {
    const user_id = req.user.id;
    const { document_type, notice_type, property_id } = req.query;

    // Build query
    let query = supabaseAdmin
      .from('notices')
      .select('*')
      .eq('user_id', user_id)
      .order('generated_at', { ascending: false });

    // Apply filters if provided
    if (document_type) {
      query = query.eq('document_type', document_type);
    }
    if (notice_type) {
      query = query.eq('notice_type', notice_type);
    }
    if (property_id) {
      query = query.eq('property_id', property_id);
    }

    const { data: notices, error } = await query;

    if (error) {
      console.error('Error listing notices:', error);
      throw error;
    }

    res.json({
      success: true,
      count: notices.length,
      notices
    });

  } catch (error) {
    console.error('Error in listNotices:', error);
    res.status(500).json({
      error: error.message || 'Failed to list notices'
    });
  }
}

/**
 * Get Single Notice
 * GET /api/notices/:id - Get a single notice by ID
 */
async function getNotice(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data: notice, error } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error || !notice) {
      return res.status(404).json({
        error: 'Notice not found'
      });
    }

    res.json({
      success: true,
      notice
    });

  } catch (error) {
    console.error('Error in getNotice:', error);
    res.status(500).json({
      error: error.message || 'Failed to get notice'
    });
  }
}

/**
 * Subtask 3.6.3: On-Demand PDF Download
 * GET /api/notices/:id/download - Generate and download PDF on-demand
 * Subtask 3.6.9: Track downloads (increment counter, update timestamp)
 */
async function downloadNotice(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // 1. Fetch notice metadata
    const { data: notice, error } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error || !notice) {
      return res.status(404).json({
        error: 'Notice not found'
      });
    }

    // 2. Determine template name based on notice type
    // For on-demand generation, use the document_type and notice_type
    const templateName = notice.notice_type === 'preview'
      ? `${notice.document_type}-preview-v1`
      : `${notice.document_type}-v1`;

    // 3. Regenerate PDF from form_data JSONB
    // This is the core of on-demand generation - no storage, regenerate every time
    // Step 1: Render HTML from template with form_data
    const htmlContent = TemplateEngine.render(templateName, notice.form_data);

    // Step 2: Convert HTML to PDF
    const pdfBuffer = await PdfGenerator.generatePdf(htmlContent);

    // 4. Track download (Subtask 3.6.9)
    // Increment download_count and update last_downloaded_at
    await supabaseAdmin
      .from('notices')
      .update({
        download_count: (notice.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', id);

    // 5. Return PDF directly (no storage)
    const filename = `${notice.document_type}-${notice.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error in downloadNotice:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate PDF'
    });
  }
}

/**
 * Delete Notice
 * DELETE /api/notices/:id - Delete a notice
 */
async function deleteNotice(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verify notice belongs to user before deleting
    const { data: notice, error: fetchError } = await supabaseAdmin
      .from('notices')
      .select('id')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (fetchError || !notice) {
      return res.status(404).json({
        error: 'Notice not found'
      });
    }

    // Delete notice (RLS will enforce user isolation)
    const { error: deleteError } = await supabaseAdmin
      .from('notices')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (deleteError) {
      console.error('Error deleting notice:', deleteError);
      throw deleteError;
    }

    res.json({
      success: true,
      message: 'Notice deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteNotice:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete notice'
    });
  }
}

module.exports = {
  createNotice,
  listNotices,
  getNotice,
  downloadNotice,
  deleteNotice
};
