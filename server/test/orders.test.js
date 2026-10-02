const request = require('supertest');
const app = require('../src/index');

describe('POST /api/orders', () => {
  it('should create an order successfully with valid payload', async () => {
    const payload = {
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        address: '123 Main St, Comedy City, CC 12345'
      },
      items: [
        { id: '1', title: 'Funny Tee', price: '24.99', quantity: 2 }
      ],
      total: '49.98'
    };

    const response = await request(app)
      .post('/api/orders')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('orderId');
    expect(response.body.orderId).toMatch(/^CHK-[A-Z0-9]+$/);
    expect(response.body).toHaveProperty('status', 'received');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return 400 if customer details are missing', async () => {
    const payload = {
      customer: {
        name: 'Jane Doe'
        // missing email and address
      },
      items: [{ id: '1', title: 'Funny Tee', price: '24.99', quantity: 1 }],
      total: '24.99'
    };

    const response = await request(app)
      .post('/api/orders')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 if items list is empty or missing', async () => {
    const payload = {
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        address: '123 Main St'
      },
      items: [],
      total: '0.00'
    };

    const response = await request(app)
      .post('/api/orders')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
