const fetch = require('node-fetch');
const { fetchProducts, fetchProductBySlug, queryCMS, normalizeProduct } = require('../src/services/cms');

jest.mock('node-fetch');

describe('CMS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('queryCMS', () => {
    it('successfully queries CMS and returns data', async () => {
      const mockResponseData = { data: { test: 'success' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      });

      const result = await queryCMS('query { test }');
      expect(result).toEqual({ test: 'success' });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://cms.thechucklecanvas.com/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('handles network failure (fetch throws)', async () => {
      fetch.mockRejectedValueOnce(new Error('Network offline'));

      await expect(queryCMS('query { test }')).rejects.toThrow('CMS Network Error: Network offline');
    });

    it('handles HTTP error responses (response.ok is false)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server crashed',
      });

      let error;
      try {
        await queryCMS('query { test }');
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('CMS HTTP Error: 500 Internal Server Error');
      expect(error.statusCode).toBe(502);
    });

    it('handles GraphQL errors in response body', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: 'Field "unknown" doesn\'t exist' }],
        }),
      });

      let error;
      try {
        await queryCMS('query { unknown }');
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('CMS GraphQL Error: Field "unknown" doesn\'t exist');
      expect(error.statusCode).toBe(400);
      expect(error.graphqlErrors).toHaveLength(1);
    });
  });

  describe('fetchProducts', () => {
    it('fetches and normalizes products successfully', async () => {
      const mockGraphQLResponse = {
        data: {
          products: {
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor123',
            },
            nodes: [
              {
                id: 'prod-1',
                title: 'Funny Dog Canvas',
                slug: 'funny-dog-canvas',
                price: '$29.99',
                image: { sourceUrl: 'https://img.com/dog.jpg' },
                description: 'A hilarious dog canvas.',
              },
            ],
          },
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      });

      const result = await fetchProducts(10, null, { 'woocommerce-session': 'session-xyz' });

      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.endCursor).toBe('cursor123');
      expect(result.products).toHaveLength(1);
      expect(result.products[0]).toEqual({
        id: 'prod-1',
        title: 'Funny Dog Canvas',
        slug: 'funny-dog-canvas',
        price: '$29.99',
        imageUrl: 'https://img.com/dog.jpg',
        description: 'A hilarious dog canvas.',
        galleryImages: [],
      });

      // Verify custom headers like woocommerce-session were forwarded
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'woocommerce-session': 'session-xyz',
          }),
        })
      );
    });
  });

  describe('fetchProductBySlug', () => {
    it('fetches and normalizes a single product with gallery and variants', async () => {
      const mockGraphQLResponse = {
        data: {
          product: {
            id: 'prod-2',
            title: 'Sarcastic Cat Canvas',
            slug: 'sarcastic-cat-canvas',
            price: '$34.99',
            description: 'A sarcastic cat.',
            shortDescription: 'Short desc',
            image: { sourceUrl: 'https://img.com/cat.jpg' },
            galleryImages: {
              nodes: [
                { sourceUrl: 'https://img.com/cat-1.jpg' },
                { sourceUrl: 'https://img.com/cat-2.jpg' },
              ],
            },
            variations: {
              nodes: [
                {
                  id: 'var-1',
                  name: 'Small - 12x16',
                  price: '$34.99',
                  regularPrice: '$34.99',
                  attributes: { nodes: [{ name: 'Size', value: 'Small' }] },
                },
              ],
            },
          },
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      });

      const product = await fetchProductBySlug('sarcastic-cat-canvas');

      expect(product).toBeDefined();
      expect(product.id).toBe('prod-2');
      expect(product.title).toBe('Sarcastic Cat Canvas');
      expect(product.slug).toBe('sarcastic-cat-canvas');
      expect(product.price).toBe('$34.99');
      expect(product.imageUrl).toBe('https://img.com/cat.jpg');
      expect(product.galleryImages).toEqual([
        'https://img.com/cat-1.jpg',
        'https://img.com/cat-2.jpg',
      ]);
      expect(product.variants).toHaveLength(1);
      expect(product.variants[0].id).toBe('var-1');
      expect(product.variants[0].name).toBe('Small - 12x16');
    });

    it('returns null when product is not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { product: null } }),
      });

      const product = await fetchProductBySlug('non-existent');
      expect(product).toBeNull();
    });
  });

  describe('normalizeProduct edge cases', () => {
    it('returns null for null node', () => {
      expect(normalizeProduct(null)).toBeNull();
    });
  });
});
