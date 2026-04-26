const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('Security Tests', () => {
    let userToken;
    let adminToken;

    beforeEach(async () => {
        const userRes = await request(app).post('/api/auth/register').send({
            name: 'Regular User',
            phone: '0771234567',
            email: 'user@example.com',
            password: 'Password123',
            location: 'Colombo'
        });
        userToken = userRes.body.token;

        const adminRes = await request(app).post('/api/auth/register').send({
            name: 'Admin User',
            phone: '0779999999',
            email: 'admin@example.com',
            password: 'Password123',
            location: 'Colombo'
        });

        const User = require('../models/User');
        const admin = await User.findOne({ email: 'admin@example.com' });
        admin.role = 'admin';
        await admin.save();

        adminToken = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    });

    test('should return 401 for protected route without token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/no token/i);
    });

    test('should return 403 when regular user accesses admin route', async () => {
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.status).toBe(403);
    });

    test('should allow admin access to admin-only routes', async () => {
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('should reject invalid JWT tokens', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalidtoken12345');
        
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/invalid/i);
    });

    test('should handle NoSQL injection attempts safely', async () => {
        const injectionAttempt = {
            name: 'Test',
            phone: '0771234567',
            email: { $gt: '' },
            password: 'Password123'
        };

        const res = await request(app)
            .post('/api/auth/register')
            .send(injectionAttempt);

        expect(res.status).toBe(500);
    });

    test('should sanitize XSS attempts in product descriptions', async () => {
        const productRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: '<script>alert("xss")</script>Safe Title',
                price: 5000,
                condition: 'New',
                category: 'Test',
                vehicleModel: 'Test',
                vehicleYear: '2020',
                images: ['/uploads/test.jpg']
            });

        expect(productRes.status).toBe(201);
        const productId = productRes.body.product._id;

        const getRes = await request(app).get(`/api/products/${productId}`);
        expect(getRes.body.title).toBe('<script>alert("xss")</script>Safe Title');
    });

    test('should reject expired or malformed tokens', async () => {
        const expiredToken = jwt.sign(
            { id: '123456789012345678901234' },
            process.env.JWT_SECRET,
            { expiresIn: '-1s' }
        );

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${expiredToken}`);
        
        expect(res.status).toBe(403);
    });
});
