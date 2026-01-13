const { supabaseAdmin } = require('../config/supabase');

/**
 * Get active version of a legal document
 */
const getActiveDocument = async (req, res) => {
  try {
    const { documentType } = req.params;

    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('legal_documents')
      .select('id, document_type, version, document_name, content, effective_date, created_at')
      .eq('document_type', documentType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching active document:', error);
      return res.status(500).json({ error: 'Failed to fetch document' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getActiveDocument:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get document history (all versions)
 */
const getDocumentHistory = async (req, res) => {
  try {
    const { documentType } = req.params;

    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('legal_documents')
      .select('id, document_type, version, document_name, effective_date, is_active, created_at')
      .eq('document_type', documentType)
      .order('effective_date', { ascending: false });

    if (error) {
      console.error('Error fetching document history:', error);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in getDocumentHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all active legal documents
 */
const getAllActiveDocuments = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('legal_documents')
      .select('id, document_type, version, document_name, content, effective_date, created_at')
      .eq('is_active', true)
      .order('document_type');

    if (error) {
      console.error('Error fetching all active documents:', error);
      return res.status(500).json({ error: 'Failed to fetch documents' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in getAllActiveDocuments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getActiveDocument,
  getDocumentHistory,
  getAllActiveDocuments
};
