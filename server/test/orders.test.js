const request = require('supertest');
const app = require('../src/index');

describe('POST /api/orders', () => {
  it('should create an order successfully with complete customer, billing and payment payload', async () => {
    const payload = {
      customer: {
        firstName: 'Jane',
        middleInitial: 'M',
        lastName: 'Doe',
        email: 'jane@example.com',
        shippingAddress1: '123 Main St',
        shippingAddress2: 'Apt 4B',
        shippingCity: 'Comedy City',
        shippingState: 'CC',
        shippingZip: '12345',
        billingSameAsShipping: true,
        billingAddress1: '123 Main St',
        billingAddress2: 'Apt 4B',
        billingCity: 'Comedy City',
        billingState: 'CC',
        billingZip: '12345'
      },
      payment: {
        cardNumber: '4242••••••••4242',
        expirationDate: '12/25',
        cvcCode: '123'
      },
      items: [
        { id: '1', title: 'Funny Tee', price: '24.99', quantity: 2 }
      ],
      total: '54.98'
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

  it('should return 400 if required shipping details are missing', async () => {
    const payload = {
      customer: {
        firstName: 'Jane'
        // missing lastName, email, address fields
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
        shippingAddress1: '123 Main St',
        shippingCity: 'Comedy City',
        shippingState: 'CC',
        shippingZip: '12345'
      },
      // missing payment
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
        shippingAddress1: '123 Main St',
        shippingCity: 'Comedy City',
        shippingState: 'CC',
        shippingZip: '12345'
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
