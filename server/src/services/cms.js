const fetch = require('node-fetch');

const DEFAULT_GRAPHQL_ENDPOINT = 'https://cms.thechucklecanvas.com/graphql';

/**
 * Executes a GraphQL query against the WordPress CMS endpoint.
 * 
 * @param {string} query - The GraphQL query string.
 * @param {Object} [variables={}] - Variables for the GraphQL query.
 * @param {Object} [headers={}] - Additional headers (e.g., woocommerce-session).
 * @returns {Promise<Object>} The data property from the GraphQL response.
 */
async function queryCMS(query, variables = {}, headers = {}) {
  const endpoint = process.env.GRAPHQL_ENDPOINT || DEFAULT_GRAPHQL_ENDPOINT;

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
  } catch (networkError) {
    const err = new Error(`CMS Network Error: ${networkError.message}`);
    err.statusCode = 503;
    throw err;
  }

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.text();
    } catch (e) {
      errorBody = response.statusText;
    }
    const err = new Error(`CMS HTTP Error: ${response.status} ${response.statusText} - ${errorBody}`);
    err.statusCode = response.status >= 500 ? 502 : response.status;
    throw err;
  }

  let json;
  try {
    json = await response.json();
  } catch (parseError) {
    const err = new Error(`CMS Invalid JSON Response: ${parseError.message}`);
    err.statusCode = 502;
    throw err;
  }

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map(e => e.message).join('; ');
    const err = new Error(`CMS GraphQL Error: ${messages}`);
    err.statusCode = 400;
    err.graphqlErrors = json.errors;
    throw err;
  }

  return json.data;
}

/**
 * Normalizes a WPGraphQL product node into a standardized product object.
 */
function normalizeProduct(node) {
  if (!node) return null;

  const id = node.id;
  const title = node.title || node.name || '';
  const slug = node.slug || '';
  
  let price = node.price || node.regularPrice || null;
  if (!price && node.node && node.node.price) {
    price = node.node.price;
  }

  let imageUrl = null;
  if (node.image && node.image.sourceUrl) {
    imageUrl = node.image.sourceUrl;
  } else if (node.featuredImage && node.featuredImage.node && node.featuredImage.node.sourceUrl) {
    imageUrl = node.featuredImage.node.sourceUrl;
  }

  const description = node.description || node.shortDescription || '';

  const normalized = {
    id,
    title,
    slug,
    price,
    imageUrl,
    description,
  };

  if (node.galleryImages && node.galleryImages.nodes) {
    normalized.galleryImages = node.galleryImages.nodes.map(img => img.sourceUrl).filter(Boolean);
  }

  if (node.variations && node.variations.nodes) {
    normalized.variants = node.variations.nodes.map(v => ({
      id: v.id,
      name: v.name || v.title,
      price: v.price || v.regularPrice,
      attributes: v.attributes ? v.attributes.nodes : [],
    }));
  } else if (node.attributes && node.attributes.nodes) {
    normalized.attributes = node.attributes.nodes;
  }

  return normalized;
}

/**
 * Fetches published products with pagination.
 * 
 * @param {number} [first=20] - Number of products to fetch.
 * @param {string} [after=null] - Cursor for pagination.
 * @param {Object} [headers={}] - Request headers (e.g., woocommerce-session).
 * @returns {Promise<Object>} { products: Array, pageInfo: Object }
 */
async function fetchProducts(first = 20, after = null, headers = {}) {
  const PRODUCTS_QUERY = `
    Query GetProducts($first: Int, $after: String) {
      products(first: $first, after: $after, where: { status: "PUBLISH" }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          slug
          price
          image {
            sourceUrl
          }
          description
        }
      }
    }
  `;

  const data = await queryCMS(PRODUCTS_QUERY, { first, after }, headers);
  
  const connection = data && data.products;
  const nodes = (connection && connection.nodes) || [];
  const pageInfo = (connection && connection.pageInfo) || { hasNextPage: false, endCursor: null };

  return {
    products: nodes.map(normalizeProduct),
    pageInfo,
  };
}

/**
 * Fetches a single canvas product by slug, including full details, image gallery, and size variants.
 * 
 * @param {string} slug - Product slug.
 * @param {Object} [headers={}] - Request headers.
 * @returns {Promise<Object|null>} Normalized product details or null.
 */
async function fetchProductBySlug(slug, headers = {}) {
  const PRODUCT_BY_SLUG_QUERY = `
    Query GetProductBySlug($slug: ID!) {
      product(id: $slug, idType: SLUG) {
        id
        title
        slug
        price
        description
        shortDescription
        image {
          sourceUrl
        }
        galleryImages {
          nodes {
            sourceUrl
          }
        }
        ... on VariableProduct {
          variations {
            nodes {
              id
              name
              price
              regularPrice
              attributes {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
        attributes {
          nodes {
            name
            options
            label
          }
        }
      }
    }
  `;

  const data = await queryCMS(PRODUCT_BY_SLUG_QUERY, { slug }, headers);
  
  if (!data || !data.product) {
    return null;
  }

  return normalizeProduct(data.product);
}

module.exports = {
  queryCMS,
  fetchProducts,
  fetchProductBySlug,
  normalizeProduct,
};
