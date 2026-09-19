const fetch = require('node-fetch');
const { fetchProducts, fetchProductBySlug, graphQLClient } = require('../src/services/cms');

// Mock node-fetch
jest.mock('node-fetch');

describe('CMS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('successfully fetches and normalizes products', async () => {
      const mockApiResponse = {
        data: {
          products: {
            nodes: [
              {
                id: 'prod-1',
                title: 'Funny Cat Canvas',
                slug: 'funny-cat-canvas',
                price: '$24.99',
                description: 'A hilarious cat painting.',
                featuredImage: {
                  node: {
                    sourceUrl: 'https://example.com/cat.jpg'
                  }
                }
              }
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: 'cursor-1'
            }
          }
        }
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await fetchProducts(10, null);

      expect(fetch).toHaveBeenCalledTimes(1);
      const [endpoint, options] = fetch.mock.calls[0];
      expect(endpoint).toBe('https://cms.thechucklecanvas.com/graphql');
      
      const body = JSON.parse(options.body);
      expect(body.variables).toEqual({ first: 10, after: null });

      expect(result.products).toHaveLength(1);
      expect(result.products[0]).toEqual({
        id: 'prod-1',
        title: 'Funny Cat Canvas',
        slug: 'funny-cat-canvas',
        price: '$24.99',
        imageUrl: 'https://example.com/cat.jpg',
        description: 'A hilarious cat painting.'
      });
      expect(result.pageInfo).toEqual({
        hasNextPage: false,
        endCursor: 'cursor-1'
      });
    });

    it('handles network failures gracefully', async () => {
      fetch.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(fetchProducts()).rejects.toThrow(
        /Network error while connecting to GraphQL endpoint/
      );
      
      try {
        await fetchProducts();
      } catch (err) {
        expect(err.statusCode).toBe(503);
      }
    });

    it('handles GraphQL response errors array', async () => {
      const mockErrorResponse = {
        errors: [
          { message: 'Internal GraphQL query error' }
        ]
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockErrorResponse
      });

      await expect(fetchProducts()).rejects.toThrow(
        /GraphQL Error: Internal GraphQL query error/
      );

      try {
        await fetchProducts();
      } catch (err) {
        expect(err.statusCode).toBe(400);
        expect(err.errors).toEqual(mockErrorResponse.errors);
      }
    });

    it('handles HTTP error status codes', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server Error' })
      });

      await expect(fetchProducts()).rejects.toThrow();

      try {
        await fetchProducts();
      } catch (err) {
        expect(err.statusCode).toBe(500);
      }
    });
  });

  describe('fetchProductBySlug', () => {
    it('successfully fetches and normalizes a single product with gallery and variants', async () => {
      const mockApiResponse = {
        data: {
          product: {
            id: 'prod-2',
            title: 'Sarcastic Dog Canvas',
            slug: 'sarcastic-dog-canvas',
            price: '$34.99',
            description: 'A dog with a funny quote.',
            featuredImage: {
              node: {
                sourceUrl: 'https://example.com/dog.jpg'
              }
            },
            galleryImages: {
              nodes: [
                { sourceUrl: 'https://example.com/dog-alt1.jpg' },
                { sourceUrl: 'https://example.com/dog-alt2.jpg' }
              ]
            },
            variants: {
              nodes: [
                { id: 'var-1', name: 'Medium - 16x20', price: '$34.99' },
                { id: 'var-2', name: 'Large - 24x36', price: '$49.99' }
              ]
            },
            productCategories: {
              nodes: [
                { id: 'cat-1', name: 'Dogs', slug: 'dogs' }
              ]
            }
          }
        }
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      });

      const product = await fetchProductBySlug('sarcastic-dog-canvas');

      expect(product).toEqual({
        id: 'prod-2',
        title: 'Sarcastic Dog Canvas',
        slug: 'sarcastic-dog-canvas',
        price: '$34.99',
        imageUrl: 'https://example.com/dog.jpg',
        description: 'A dog with a funny quote.',
        gallery: [
          'https://example.com/dog-alt1.jpg',
          'https://example.com/dog-alt2.jpg'
        ],
        variants: [
          { id: 'var-1', name: 'Medium - 16x20', price: '$34.99', attributes: [] },
          { id: 'var-2', name: 'Large - 24x36', price: '$49.99', attributes: [] }
        ],
        categories: [
          { id: 'cat-1', name: 'Dogs', slug: 'dogs' }
        ]
      });
    });

    it('throws 404 when product is not found', async () => {
      const mockApiResponse = {
        data: {
          product: null
        }
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      });

      await expect(fetchProductBySlug('non-existent')).rejects.toThrow(
        /Product with slug "non-existent" not found/
      );

      try {
        await fetchProductBySlug('non-existent');
      } catch (err) {
        expect(err.statusCode).toBe(404);
      }
    });
  });

  describe('graphQLClient custom headers', () => {
    it('forwards custom headers such as woocommerce-session', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { test: true } })
      });

      await graphQLClient('query { test }', {}, { 'woocommerce-session': 'session-xyz-123' });

      expect(fetch).toHaveBeenCalledTimes(1);
      const [, options] = fetch.mock.calls[0];
      expect(options.headers).toMatchObject({
        'Content-Type': 'application/json',
        'woocommerce-session': 'session-xyz-123'
      });
    });
  });
});
