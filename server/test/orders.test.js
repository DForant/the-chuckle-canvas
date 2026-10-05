const request = require('supertest');
const app = require('../src/index');

describe('POST /api/orders', () => {
  it('should create an order successfully with complete payload including billing and payment', async () => {
    const payload = {
      customer: {
        firstName: 'Jane',
        middleInitial: 'M',
        lastName: 'Doe',
        email: 'jane@example.com',
        address1: '123 Main St',
        address2: 'Apt 4B',
        city: 'Comedy City',
        state: 'CC',
        zip: '12345'
      },
      billingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        address2: 'Apt 4B',
        city: 'Comedy City',
        state: 'CC',
        zip: '12345'
      },
      payment: {
        cardNumber: '4242424242424242',
        expirationDate: '12/25',
        cvcCode: '123'
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

  it('should return 400 if required customer details are missing', async () => {
    const payload = {
      customer: {
        firstName: 'Jane'
        // missing lastName, email, address, etc.
      },
      billingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Comedy City',
        state: 'CC',
        zip: '12345'
      },
      payment: {
        cardNumber: '4242424242424242',
        expirationDate: '12/25',
        cvcCode: '123'
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

  it('should return 400 if payment details are missing', async () => {
    const payload = {
      customer: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        address1: '123 Main St',
        city: 'Comedy City',
        state: 'CC',
        zip: '12345'
      },
      billingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Comedy City',
        state: 'CC',
        zip: '12345'
      },
      payment: {},
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
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        address1: '123 Main St',
        city: 'Comedy City',
        state: 'CC',
        zip: '12345'
      },
      billingAddress: {
        firstName: 'Jane',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Comedy City',
        state: 'CC',
        zip: '12345'
      },
      payment: {
        cardNumber: '4242424242424242',
        expirationDate: '12/25',
        cvcCode: '123'
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
