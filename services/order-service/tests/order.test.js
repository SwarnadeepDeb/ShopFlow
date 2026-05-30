const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
const pool = require('../src/config/db');

describe('Order Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/orders', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/orders').send({});
      expect(res.status).toBe(400);
    });

    it('creates an order and returns 201', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, user_id: 1, product_id: 2, quantity: 3, status: 'pending' }],
      });
      const res = await request(app)
        .post('/api/orders')
        .send({ user_id: 1, product_id: 2, quantity: 3 });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });
  });

  describe('GET /api/orders', () => {
    it('returns list of orders', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'pending' }] });
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('returns 400 for invalid status', async () => {
      const res = await request(app).put('/api/orders/1').send({ status: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('updates order status', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, status: 'shipped' }],
      });
      const res = await request(app).put('/api/orders/1').send({ status: 'shipped' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('shipped');
    });
  });
});
