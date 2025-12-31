const express = require('express');
const request = require('supertest');

// Mock auth middleware to inject a user
jest.mock('../middleware/auth', () => (req, res, next) => { req.user = { id: 'user-1' }; next(); });

// Mock Order model and notification utility
const mockFindById = jest.fn();
jest.mock('../models/Order', () => ({ findById: mockFindById }));
const mockNotify = { sendNotification: jest.fn().mockResolvedValue({ ok: true }) };
jest.mock('../utils/notification', () => mockNotify);

describe('/api/payments', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    // require the router after mocks
    const paymentsRouter = require('../routes/payments');
    app.use('/api/payments', paymentsRouter);
  });

  beforeEach(() => {
    mockFindById.mockReset();
    mockNotify.sendNotification.mockClear();
  });

  test('POST /pay returns 400 when orderId missing', async () => {
    const res = await request(app).post('/api/payments/pay').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /pay returns 404 when order not found', async () => {
    mockFindById.mockResolvedValue(null);
    const res = await request(app).post('/api/payments/pay').send({ orderId: 'nope' });
    expect(res.status).toBe(404);
  });

  test('POST /pay returns 403 when user mismatch', async () => {
    mockFindById.mockResolvedValue({ user: 'other-user' });
    const res = await request(app).post('/api/payments/pay').send({ orderId: 'o1' });
    expect(res.status).toBe(403);
  });

  test('POST /pay succeeds and updates order', async () => {
    const fakeOrder = { user: 'user-1', total: 15.5, save: jest.fn().mockResolvedValue(true), _id: 'order-1' };
    mockFindById.mockResolvedValue(fakeOrder);
    const res = await request(app).post('/api/payments/pay').send({ orderId: 'order-1', method: 'stub' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('payment');
    expect(res.body.status).toBe('paid');
    expect(fakeOrder.save).toHaveBeenCalled();
    expect(mockNotify.sendNotification).toHaveBeenCalled();
  });
});
