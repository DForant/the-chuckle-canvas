const {
  graphQLClient,
  fetchProducts,
  fetchProductBySlug,
  normalizeProduct,
  normalizeProductDetail
} = require('../src/services/cms');
const fetch = require('node-fetch');

jest.mock('node-fetch', () => jest.fn());

describe('CMS Service Layer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeProduct', () => {
    it('should correctly normalize a WooCommerce product node', () => {
      const rawNode = {
        id: 'prod-123',
        name: 'Funny Dog Canvas',
        slug: 'funny-dog-canvas',
        price: '$29.99',
        regularPrice: '$34.99',
        image: { sourceUrl: 'https://cdn.example.com/dog.jpg', altText: 'Dog' },
        description: 'A hilarious dog portrait on canvas.'
      };

      const normalized = normalizeProduct(rawNode);

      expect(normalized).toEqual({
        id: 'prod-123',
        title: 'Funny Dog Canvas',
        slug: 'funny-dog-canvas',
        price: '$29.99',
        imageUrl: 'https://cdn.example.com/dog.jpg',
        description: 'A hilarious dog portrait on canvas.'
      });
    });

    it('should return null when node is undefined', () => {
      expect(normalizeProduct(null)).toBeNull();
    });
  });

  describe('normalizeProductDetail', () => {
    it('should normalize detailed product with variations and categories', () => {
      const rawNode = {
        id: 'prod-456',
        name: 'Cat Meme Canvas',
        slug: 'cat-meme-canvas',
        price: '$39.99',
        description: 'Cat meme wall art.',
        image: { sourceUrl: 'https://cdn.example.com/cat.jpg' },
        galleryImages: {
          nodes: [{ sourceUrl: 'https://cdn.example.com/cat-angle.jpg' }]
        },
        variations: {
          nodes: [
            {
              id: 'var-1',
              name: '12x16',
              price: '$39.99',
              attributes: { nodes: [{ name: 'Size', value: '12x16' }] }
            }
          ]
        },
        productCategories: {
          nodes: [{ id: 'cat-1', name: 'Animals', slug: 'animals' }]
        }
      };

      const detailed = normalizeProductDetail(rawNode);

      expect(detailed.title).toBe('Cat Meme Canvas');
      expect(detailed.gallery).toContain('https://cdn.example.com/cat-angle.jpg');
      expect(detailed.variants).toHaveLength(1);
      expect(detailed.variants[0].name).toBe('12x16');
      expect(detailed.categories[0].slug).toBe('animals');
    });
  });

  describe('fetchProducts', () => {
    it('should query WPGraphQL and return an array of normalized products', async () => {
      const mockResponse = {
        data: {
          products: {
            pageInfo: { hasNextPage: false, endCursor: 'cursor123' },
            nodes: [
              {
                id: 'prod-1',
                name: 'Laughing Dog',
                slug: 'laughing-dog',
                price: '$24.99',
                image: { sourceUrl: 'https://cdn.example.com/laughing.jpg' },
                description: 'Test description'
              }
            ]
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchProducts(10);

      expect(result.products).toHaveLength(1);
      expect(result.products[0].title).toBe('Laughing Dog');
      expect(result.pageInfo.hasNextPage).toBe(false);
    });
  });

  describe('fetchProductBySlug', () => {
    it('should return normalized single product detail for existing slug', async () => {
      const mockResponse = {
        data: {
          product: {
            id: 'prod-99',
            name: 'Office Joke Canvas',
            slug: 'office-joke-canvas',
            price: '$19.99',
            description: 'Funny office wall decor',
            image: { sourceUrl: 'https://cdn.example.com/office.jpg' },
            galleryImages: { nodes: [] },
            variations: { nodes: [] },
            productCategories: { nodes: [] }
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const product = await fetchProductBySlug('office-joke-canvas');

      expect(product.id).toBe('prod-99');
      expect(product.title).toBe('Office Joke Canvas');
    });

    it('should throw 404 when product node is null', async () => {
      const mockResponse = {
        data: {
          product: null
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(fetchProductBySlug('non-existent')).rejects.toMatchObject({
        statusCode: 404
      });
    });
  });

  describe('graphQLClient Error Handling', () => {
    it('should throw a 503 on network fetch errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Connection timed out'));

      await expect(graphQLClient('{ test }')).rejects.toMatchObject({
        statusCode: 503
      });
    });

it('should throw on GraphQL errors array in response', async () => {
      const mockResponse = {
        errors: [{ message: 'Syntax Error: Cannot query field "badField" on type "Query"' }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(graphQLClient('{ badQuery }')).rejects.toMatchObject({
        statusCode: 400
      });
    });  
  });
});