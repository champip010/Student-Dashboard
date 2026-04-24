import request from 'supertest';
import app from '../src/index.js';

describe('Auth Endpoints', () => {
  it('should return 401 for protected route without token', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'No token provided');
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@school.edu', password: 'wrongpassword' });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@school.edu', password: 'admin123' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'ADMIN');
  });
});
