const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Authentication Module Tests', () => {
    const testUser = {
        name: 'Test User',
        phone: '0771234567',
        email: 'test@example.com',
        password: 'Password123',
        location: 'Colombo'
    };

    describe('POST /api/auth/register', () => {
        test('should register a new user with valid details', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Registration successful.');
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe(testUser.email);
        });

        test('should reject registration with duplicate email', async () => {
            await request(app).post('/api/auth/register').send(testUser);
            
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(res.status).toBe(409);
            expect(res.body.message).toBe('Email is already registered.');
        });

        test('should reject registration without required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Test', email: 'incomplete@example.com' });
            
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(testUser);
        });

        test('should login with valid credentials and return JWT', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ emailOrUsername: testUser.email, password: testUser.password });
            
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe(testUser.email);
        });

        test('should reject login with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ emailOrUsername: testUser.email, password: 'WrongPassword' });
            
            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/invalid/i);
        });
    });

    describe('GET /api/auth/me', () => {
        let token;

        beforeEach(async () => {
            const registerRes = await request(app).post('/api/auth/register').send(testUser);
            token = registerRes.body.token;
        });

        test('should return current user profile with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.email).toBe(testUser.email);
            expect(res.body.name).toBe(testUser.name);
        });

        test('should reject request without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });

        test('should handle expired/invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken123');
            
            expect(res.status).toBe(403);
        });

        test('should reject deleted user token', async () => {
            const user = await User.findOne({ email: testUser.email });
            await User.findByIdAndDelete(user._id);
            
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/no longer exists/i);
        });
    });

    describe('PUT /api/auth/profile', () => {
        let token;

        beforeEach(async () => {
            const registerRes = await request(app).post('/api/auth/register').send(testUser);
            token = registerRes.body.token;
        });

        test('should update profile fields successfully', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name', phone: '0779999999' });
            
            expect(res.status).toBe(200);
            expect(res.body.user.name).toBe('Updated Name');
            expect(res.body.user.phone).toBe('0779999999');
        });
    });

    describe('Role-based Access Control', () => {
        test('should return 403 when regular user accesses admin route', async () => {
            const registerRes = await request(app).post('/api/auth/register').send(testUser);
            const token = registerRes.body.token;
            
            const res = await request(app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(403);
        });

        test('should allow admin to access user management', async () => {
            const adminUser = new User({
                name: 'Admin User',
                phone: '0770000000',
                email: 'admin@sparehub.lk',
                passwordHash: 'hashedpassword',
                role: 'admin'
            });
            await adminUser.save();
            
            const jwt = require('jsonwebtoken');
            const adminToken = jwt.sign(
                { id: adminUser._id, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            const res = await request(app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('Password Security', () => {
        test('should store password as bcrypt hash, not plain text', async () => {
            await request(app).post('/api/auth/register').send(testUser);
            const user = await User.findOne({ email: testUser.email });
            
            expect(user.passwordHash).not.toBe(testUser.password);
            expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
        });
    });
});
