const request = require('supertest');
const app = require('../src/index');
const cmsService = require('../src/services/cms');

jest.mock('../src/services/cms');

describe('Products API Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return 200 and products array schema', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          title: 'Funny Dog Canvas',
          slug: 'funny-dog-canvas',
          price: '$29.99',
          imageUrl: 'https://example.com/dog.jpg',
          description: 'A hilarious dog canvas.'
        }
      ];

      cmsService.fetchProducts.mockResolvedValue({
        products: mockProducts,
        pageInfo: { hasNextPage: false, endCursor: null }
      });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          slug: expect.any(String),
          price: expect.any(String),
          imageUrl: expect.any(String),
          description: expect.any(String)
        })
      );
      expect(cmsService.fetchProducts).toHaveBeenCalledTimes(1);
    });

    it('should fall back to mock products gracefully when cms service throws error', async () => {
      cmsService.fetchProducts.mockRejectedValue(new Error('CMS Connection Error'));

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('should return 200 and product JSON when found', async () => {
      const mockProductDetail = {
        id: 'prod-1',
        title: 'Funny Cat Canvas',
        slug: 'funny-cat-canvas',
        price: '$34.99',
        imageUrl: 'https://example.com/cat.jpg',
        description: 'A funny cat canvas.',
        gallery: ['https://example.com/cat2.jpg'],
        variants: [],
        categories: [{ id: 'cat-1', name: 'Cats', slug: 'cats' }]
      };

      cmsService.fetchProductBySlug.mockResolvedValue(mockProductDetail);

      const response = await request(app).get('/api/products/funny-cat-canvas');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProductDetail);
      expect(cmsService.fetchProductBySlug).toHaveBeenCalledWith('funny-cat-canvas');
    });

    it('should return 404 on missing slug when no fallback exists', async () => {
      const notFoundError = new Error('Product not found');
      notFoundError.statusCode = 404;
      cmsService.fetchProductBySlug.mockRejectedValue(notFoundError);

      const response = await request(app).get('/api/products/completely-non-existent-slug-12345');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
