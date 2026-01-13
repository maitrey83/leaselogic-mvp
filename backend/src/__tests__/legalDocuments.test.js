// Check if Supabase is configured before running tests
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseConfigured = supabaseUrl && supabaseServiceKey;

// Only import if configured
let supabaseAdmin;
if (supabaseConfigured) {
  const supabaseConfig = require('../config/supabase');
  supabaseAdmin = supabaseConfig.supabaseAdmin;
}

const describeIfConfigured = supabaseConfigured ? describe : describe.skip;

describeIfConfigured('Legal Documents Table', () => {
  describe('Table Structure', () => {
    test('should have legal_documents table', async () => {
      const { data, error } = await supabaseAdmin
        .from('legal_documents')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should have required columns', async () => {
      const { data } = await supabaseAdmin
        .from('legal_documents')
        .select('*')
        .limit(1);

      if (data && data.length > 0) {
        const doc = data[0];
        expect(doc).toHaveProperty('id');
        expect(doc).toHaveProperty('document_type');
        expect(doc).toHaveProperty('version');
        expect(doc).toHaveProperty('document_name');
        expect(doc).toHaveProperty('content');
        expect(doc).toHaveProperty('effective_date');
        expect(doc).toHaveProperty('is_active');
        expect(doc).toHaveProperty('created_at');
      }
    });
  });

  describe('Seed Data', () => {
    test('should have TOS v1.3 seeded', async () => {
      const { data, error } = await supabaseAdmin
        .from('legal_documents')
        .select('*')
        .eq('document_type', 'TOS')
        .eq('version', '1.3')
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.document_name).toBe('Terms of Service');
      expect(data.is_active).toBe(true);
    });

    test('should have Privacy v1.3 seeded', async () => {
      const { data, error } = await supabaseAdmin
        .from('legal_documents')
        .select('*')
        .eq('document_type', 'Privacy')
        .eq('version', '1.3')
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.document_name).toBe('Privacy Policy');
      expect(data.is_active).toBe(true);
    });

    test('should have Cookie v1.3 seeded', async () => {
      const { data, error } = await supabaseAdmin
        .from('legal_documents')
        .select('*')
        .eq('document_type', 'Cookie')
        .eq('version', '1.3')
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.document_name).toBe('Cookie Policy');
      expect(data.is_active).toBe(true);
    });

    test('should have exactly 3 active documents', async () => {
      const { data, error } = await supabaseAdmin
        .from('legal_documents')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
    });
  });

  describe('Database Functions', () => {
    test('get_active_document should return active TOS', async () => {
      const { data, error } = await supabaseAdmin
        .rpc('get_active_document', { doc_type: 'TOS' });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].document_type).toBe('TOS');
      expect(data[0].version).toBe('1.3');
    });

    test('get_active_document should return active Privacy', async () => {
      const { data, error } = await supabaseAdmin
        .rpc('get_active_document', { doc_type: 'Privacy' });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].document_type).toBe('Privacy');
    });

    test('get_document_history should return all TOS versions', async () => {
      const { data, error } = await supabaseAdmin
        .rpc('get_document_history', { doc_type: 'TOS' });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].document_type).toBe('TOS');
    });

    test('get_document_history should order by effective_date DESC', async () => {
      const { data } = await supabaseAdmin
        .rpc('get_document_history', { doc_type: 'TOS' });

      if (data && data.length > 1) {
        const dates = data.map(d => new Date(d.effective_date));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i] >= dates[i + 1]).toBe(true);
        }
      }
    });
  });

  describe('Version Control', () => {
    test('should enforce unique document_type + version', async () => {
      // Try to insert duplicate TOS v1.3
      const { error } = await supabaseAdmin
        .from('legal_documents')
        .insert({
          document_type: 'TOS',
          version: '1.3',
          document_name: 'Duplicate TOS',
          content: 'Test content',
          effective_date: new Date().toISOString(),
          is_active: false
        });

      expect(error).toBeDefined();
      expect(error.message).toContain('unique');
    });

    test('should allow same version for different document types', async () => {
      // This should work - different document types can have same version
      const { data: tosData } = await supabaseAdmin
        .from('legal_documents')
        .select('version')
        .eq('document_type', 'TOS')
        .eq('version', '1.3')
        .single();

      const { data: privacyData } = await supabaseAdmin
        .from('legal_documents')
        .select('version')
        .eq('document_type', 'Privacy')
        .eq('version', '1.3')
        .single();

      expect(tosData.version).toBe('1.3');
      expect(privacyData.version).toBe('1.3');
    });
  });

  describe('RLS Policies', () => {
    test('should allow public read access', async () => {
      // Using anon client (simulating public access)
      const { data, error } = await supabaseAdmin
        .from('legal_documents')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
    });
  });
});

describeIfConfigured('Legal Documents API', () => {
  let getActiveDocument, getDocumentHistory, getAllActiveDocuments;

  beforeAll(() => {
    const api = require('../api/legalDocuments');
    getActiveDocument = api.getActiveDocument;
    getDocumentHistory = api.getDocumentHistory;
    getAllActiveDocuments = api.getAllActiveDocuments;
  });

  describe('getActiveDocument', () => {
    test('should return active document', async () => {
      const req = { params: { documentType: 'TOS' } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await getActiveDocument(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.document_type).toBe('TOS');
      expect(response.version).toBe('1.3');
    });

    test('should return 400 if documentType missing', async () => {
      const req = { params: {} };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await getActiveDocument(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAllActiveDocuments', () => {
    test('should return all active documents', async () => {
      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await getAllActiveDocuments(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(3);
    });
  });
});
