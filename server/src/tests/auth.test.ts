import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';

beforeAll(async () => {
    // Connect to a test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/antichess_test';
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(401);
    });
});
