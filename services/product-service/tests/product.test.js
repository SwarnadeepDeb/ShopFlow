const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/config/db', () => ({ query: jest.fn() }));
const pool = require('../src/config/db');

describe('Product Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/products', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/products').send({});
      expect(res.status).toBe(400);
    });

    it('creates a product and returns 201', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Laptop', price: 999.99, stock: 10, created_at: new Date() }],
      });
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Laptop', price: 999.99, stock: 10 });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Laptop');
    });
  });

  describe('GET /api/products', () => {
    it('returns list of products', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Laptop', price: 999.99 }] });
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns 404 when product not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get('/api/products/999');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('returns 404 when product not found', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });
      const res = await request(app).delete('/api/products/999');
      expect(res.status).toBe(404);
    });
  });
});
