const request = require('supertest');
const app = require('../src/index');

describe('GET /health', () => {
  it('should return 200 OK with status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
