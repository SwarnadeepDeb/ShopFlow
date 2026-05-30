const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
const pool = require('../src/config/db');

describe('User Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/users/register', () => {
    it('returns 400 when fields are missing', async () => {
      const res = await request(app).post('/api/users/register').send({});
      expect(res.status).toBe(400);
    });

    it('registers a user and returns 201', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Alice', email: 'alice@test.com', created_at: new Date() }],
      });
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.email).toBe('alice@test.com');
    });

    it('returns 409 on duplicate email', async () => {
      const err = new Error('duplicate');
      err.code = '23505';
      pool.query.mockRejectedValueOnce(err);
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/users/login', () => {
    it('returns 400 when fields are missing', async () => {
      const res = await request(app).post('/api/users/login').send({});
      expect(res.status).toBe(400);
    });

    it('returns 401 when user not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'nobody@test.com', password: 'pass' });
      expect(res.status).toBe(401);
    });
  });
});
