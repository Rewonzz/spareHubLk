const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Product Listing Module Tests', () => {
    let token;
    let userId;

    beforeEach(async () => {
        const registerRes = await request(app).post('/api/auth/register').send({
            name: 'Seller User',
            phone: '0771234567',
            email: 'seller@example.com',
            password: 'Password123',
            location: 'Colombo'
        });
        token = registerRes.body.token;
        userId = registerRes.body.user.id;
    });

    describe('POST /api/products', () => {
        test('should create a listing with all required fields', async () => {
            const product = {
                title: 'Brake Pad Set for Toyota Axio',
                price: 8500,
                condition: 'New',
                category: 'Brake System',
                vehicleModel: 'Toyota Axio',
                vehicleYear: '2015',
                images: ['/uploads/test-image.jpg']
            };

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send(product);

            expect(res.status).toBe(201);
            expect(res.body.product.title).toBe(product.title);
            expect(res.body.product.price).toBe(product.price);
        });

        test('should reject listing without required fields', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Incomplete Listing' });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/required/i);
        });

        test('should reject listing creation without authentication', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({
                    title: 'Test Product',
                    price: 5000,
                    category: 'Test',
                    vehicleModel: 'Test',
                    vehicleYear: '2020'
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/products', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Brake Pad for Toyota',
                    price: 8500,
                    condition: 'New',
                    category: 'Brake System',
                    vehicleModel: 'Toyota Axio',
                    vehicleYear: '2015',
                    images: ['/uploads/test.jpg']
                });

            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Oil Filter for Honda',
                    price: 2500,
                    condition: 'Used',
                    category: 'Engine Parts',
                    vehicleModel: 'Honda Civic',
                    vehicleYear: '2018',
                    images: ['/uploads/test2.jpg']
                });
        });

        test('should return all products with keyword search', async () => {
            const res = await request(app).get('/api/products?search=brake');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        });

        test('should filter products by category', async () => {
            const res = await request(app).get('/api/products?category=Brake System');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.every(p => p.category === 'Brake System')).toBe(true);
        });

        test('should combine category and search filters', async () => {
            const res = await request(app).get('/api/products?category=Brake System&search=brake');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.every(p => p.category === 'Brake System')).toBe(true);
        });

        test('should return empty array for non-matching search', async () => {
            const res = await request(app).get('/api/products?search=nonexistentpartxyz');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });

    describe('GET /api/products/:id', () => {
        let productId;

        beforeEach(async () => {
            const createRes = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Product for Viewing',
                    price: 5000,
                    condition: 'New',
                    category: 'Test',
                    vehicleModel: 'Test Model',
                    vehicleYear: '2020',
                    images: ['/uploads/test.jpg']
                });
            productId = createRes.body.product._id;
        });

        test('should return product details and increment views', async () => {
            const res = await request(app).get(`/api/products/${productId}`);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Test Product for Viewing');
            expect(res.body.views).toBe(1);
        });
    });
});
