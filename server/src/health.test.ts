import request from 'supertest';
import app from '../src/index.js';

describe('Health Check', () => {
  it('should return 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
