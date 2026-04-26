const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('Premium Seller Workflow Tests', () => {
    let userToken;
    let userId;
    let adminToken;

    beforeEach(async () => {
        const userRes = await request(app).post('/api/auth/register').send({
            name: 'Applicant User',
            phone: '0771234567',
            email: 'applicant@example.com',
            password: 'Password123',
            location: 'Colombo'
        });
        userToken = userRes.body.token;
        userId = userRes.body.user.id;

        const User = require('../models/User');
        const admin = new User({
            name: 'Admin User',
            phone: '0779999999',
            email: 'admin@example.com',
            passwordHash: 'hashedpassword',
            role: 'admin'
        });
        await admin.save();

        adminToken = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    });

    test('should allow user to submit PRO application', async () => {
        const res = await request(app)
            .post('/api/premium/apply')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                businessName: 'Auto Parts Lanka',
                fullName: 'Test Seller',
                nicNumber: '123456789V',
                mobileNumber: '0771234567',
                email: 'applicant@example.com',
                businessAddress: 'Colombo 03',
                city: 'Colombo',
                businessType: 'wholesaler'
            });

        expect(res.status).toBe(201);
        expect(res.body.application.status).toBe('pending');
    });

    test('should allow user to view their application status', async () => {
        await request(app)
            .post('/api/premium/apply')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                businessName: 'Auto Parts Lanka',
                fullName: 'Test Seller',
                nicNumber: '123456789V',
                mobileNumber: '0771234567',
                email: 'applicant@example.com',
                businessAddress: 'Colombo 03',
                city: 'Colombo',
                businessType: 'wholesaler'
            });

        const res = await request(app)
            .get('/api/premium/my-application')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('pending');
    });

    test('should allow admin to approve application', async () => {
        const appRes = await request(app)
            .post('/api/premium/apply')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                businessName: 'Auto Parts Lanka',
                fullName: 'Test Seller',
                nicNumber: '123456789V',
                mobileNumber: '0771234567',
                email: 'applicant@example.com',
                businessAddress: 'Colombo 03',
                city: 'Colombo',
                businessType: 'wholesaler'
            });

        const applicationId = appRes.body.application.id;

        const res = await request(app)
            .put(`/api/premium/${applicationId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'approved' });

        expect(res.status).toBe(200);
        expect(res.body.application.status).toBe('approved');

        const User = require('../models/User');
        const updatedUser = await User.findById(userId);
        expect(updatedUser.isPremium).toBe(true);
    });

    test('should allow admin to reject application', async () => {
        const appRes = await request(app)
            .post('/api/premium/apply')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                businessName: 'Auto Parts Lanka',
                fullName: 'Test Seller',
                nicNumber: '123456789V',
                mobileNumber: '0771234567',
                email: 'applicant@example.com',
                businessAddress: 'Colombo 03',
                city: 'Colombo',
                businessType: 'wholesaler'
            });

        const applicationId = appRes.body.application.id;

        const res = await request(app)
            .put(`/api/premium/${applicationId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'rejected' });

        expect(res.status).toBe(200);
        expect(res.body.application.status).toBe('rejected');
    });

    test('should display enhanced profile for approved PRO seller', async () => {
        const appRes = await request(app)
            .post('/api/premium/apply')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                businessName: 'Auto Parts Lanka',
                fullName: 'Test Seller',
                nicNumber: '123456789V',
                mobileNumber: '0771234567',
                email: 'applicant@example.com',
                businessAddress: 'Colombo 03',
                city: 'Colombo',
                businessType: 'wholesaler'
            });

        const applicationId = appRes.body.application.id;

        await request(app)
            .put(`/api/premium/${applicationId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'approved' });

        const res = await request(app).get(`/api/premium/seller/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body.isPremium).toBe(true);
    });
});
