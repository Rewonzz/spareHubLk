const request = require('supertest');
const app = require('../server');

describe('Review and Rating Module Tests', () => {
    let buyerToken;
    let sellerToken;
    let productId;
    let sellerId;

    beforeEach(async () => {
        const sellerRes = await request(app).post('/api/auth/register').send({
            name: 'Seller User',
            phone: '0771111111',
            email: 'seller@example.com',
            password: 'Password123',
            location: 'Colombo'
        });
        sellerToken = sellerRes.body.token;
        sellerId = sellerRes.body.user.id;

        const buyerRes = await request(app).post('/api/auth/register').send({
            name: 'Buyer User',
            phone: '0772222222',
            email: 'buyer@example.com',
            password: 'Password123',
            location: 'Colombo'
        });
        buyerToken = buyerRes.body.token;

        const productRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                title: 'Test Product for Reviews',
                price: 5000,
                condition: 'New',
                category: 'Test',
                vehicleModel: 'Toyota',
                vehicleYear: '2020',
                images: ['/uploads/test.jpg']
            });
        productId = productRes.body.product._id;
    });

    test('should allow buyer to submit a product review', async () => {
        const res = await request(app)
            .post(`/api/reviews/${productId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ rating: 5, comment: 'Excellent quality brake pads!' });

        expect(res.status).toBe(201);
        expect(res.body.review.rating).toBe(5);
        expect(res.body.review.comment).toBe('Excellent quality brake pads!');
    });

    test('should prevent duplicate reviews from same user', async () => {
        await request(app)
            .post(`/api/reviews/${productId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ rating: 5, comment: 'First review' });

        const res = await request(app)
            .post(`/api/reviews/${productId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ rating: 4, comment: 'Duplicate review' });

        expect(res.status).toBe(409);
    });

    test('should prevent seller from reviewing their own product', async () => {
        const res = await request(app)
            .post(`/api/reviews/${productId}`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ rating: 5, comment: 'My own product is great!' });

        expect(res.status).toBe(403);
    });

    test('should allow user to delete their own review', async () => {
        const reviewRes = await request(app)
            .post(`/api/reviews/${productId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ rating: 5, comment: 'Review to delete' });

        const reviewId = reviewRes.body.review._id;

        const deleteRes = await request(app)
            .delete(`/api/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(deleteRes.status).toBe(200);
    });

    test('should get all reviews for a product', async () => {
        await request(app)
            .post(`/api/reviews/${productId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ rating: 5, comment: 'Great product!' });

        const res = await request(app).get(`/api/reviews/${productId}`);
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    test('should allow seller review submission', async () => {
        const res = await request(app)
            .post(`/api/seller-reviews/${sellerId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ rating: 5, comment: 'Reliable seller!' });

        expect(res.status).toBe(201);
    });

    test('should prevent self-review for seller', async () => {
        const res = await request(app)
            .post(`/api/seller-reviews/${sellerId}`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ rating: 5, comment: 'Reviewing myself' });

        expect(res.status).toBe(403);
    });
});
