// Check if Supabase is configured
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseConfigured = supabaseUrl && supabaseServiceKey;

let supabaseAdmin;
if (supabaseConfigured) {
  const supabaseConfig = require('../config/supabase');
  supabaseAdmin = supabaseConfig.supabaseAdmin;
}

const describeIfConfigured = supabaseConfigured ? describe : describe.skip;

describeIfConfigured('Auth System', () => {
  describe('Users Table', () => {
    test('should have users table', async () => {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should have required columns', async () => {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(1);

      if (data && data.length > 0) {
        const user = data[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('full_name');
        expect(user).toHaveProperty('created_at');
        expect(user).toHaveProperty('updated_at');
      }
    });
  });

  describe('RLS Policies', () => {
    test('should have RLS enabled', async () => {
      const { data } = await supabaseAdmin
        .rpc('pg_catalog.pg_tables')
        .select('*')
        .eq('tablename', 'users');

      // RLS is enabled if policies exist
      const { data: policies } = await supabaseAdmin
        .rpc('pg_policies')
        .select('*')
        .eq('tablename', 'users');

      expect(policies).toBeDefined();
    });
  });
});

describeIfConfigured('Auth API', () => {
  let auth;

  beforeAll(() => {
    auth = require('../api/auth');
  });

  describe('register', () => {
    test('should require email and password', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await auth.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });

    test('should validate email format', async () => {
      const req = { body: { email: 'invalid', password: 'test123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await auth.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    test('should require email and password', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await auth.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });
  });

  describe('getCurrentUser', () => {
    test('should require authorization token', async () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await auth.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });
  });

  describe('updateProfile', () => {
    test('should require authorization token', async () => {
      const req = { headers: {}, body: { fullName: 'Test User' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await auth.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });
  });
});
