const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
const pool = require('../src/config/db');

describe('Notification Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/notifications', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/notifications').send({});
      expect(res.status).toBe(400);
    });

    it('creates a notification and returns 201', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, user_id: 1, message: 'Order shipped!', is_read: false }],
      });
      const res = await request(app)
        .post('/api/notifications')
        .send({ user_id: 1, message: 'Order shipped!' });
      expect(res.status).toBe(201);
      expect(res.body.is_read).toBe(false);
    });
  });

  describe('GET /api/notifications', () => {
    it('returns list of notifications', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, message: 'Hello', is_read: false }] });
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/notifications/:id', () => {
    it('marks notification as read', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, message: 'Hello', is_read: true }],
      });
      const res = await request(app).put('/api/notifications/1').send();
      expect(res.status).toBe(200);
      expect(res.body.is_read).toBe(true);
    });

    it('returns 404 when notification not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).put('/api/notifications/999').send();
      expect(res.status).toBe(404);
    });
  });
});
