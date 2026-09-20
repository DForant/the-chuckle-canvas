const fetch = require('node-fetch');

/**
 * Lightweight GraphQL client function for querying WPGraphQL.
 * 
 * @param {string} query - GraphQL query or mutation string.
 * @param {Object} [variables={}] - Query variables.
 * @param {Object} [headers={}] - Additional headers.
 * @returns {Promise<Object>} - The data object from the GraphQL response.
 */
async function graphQLClient(query, variables = {}, headers = {}) {
  const endpoint = process.env.GRAPHQL_ENDPOINT || 'https://cms.thechucklecanvas.com/graphql';

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
  } catch (networkError) {
    const error = new Error(`Network error while connecting to GraphQL endpoint: ${networkError.message}`);
    error.statusCode = 503;
    throw error;
  }

  let result;
  try {
    result = await response.json();
  } catch (jsonError) {
    const error = new Error('Invalid JSON response from GraphQL endpoint');
    error.statusCode = 502;
    throw error;
  }

  if (!response.ok) {
    const errorMsg = result.message || (result.errors && result.errors[0]?.message) || `GraphQL request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    error.errors = result.errors;
    throw error;
  }

if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map(e => e.message).join(', ');
    const error = new Error(`GraphQL Error: ${errorMessages}`);
    
    const lower = errorMessages.toLowerCase();
    // Catch WooGraphQL phrasing: "No product ID was found", "not found", "does not exist"
    if (
      lower.includes('not found') || 
      lower.includes('does not exist') || 
      lower.includes('no product') ||
      (lower.includes('found') && lower.includes('slug'))
    ) {
      error.statusCode = 404;
    } else {
      error.statusCode = 400;
    }
    error.errors = result.errors;
    throw error;
  }
  
  return result.data;
}

/**
 * Normalizes a WPGraphQL product node into standard format.
 */
function normalizeProduct(node) {
  if (!node) return null;

  let price = node.price || node.regularPrice || null;
  let imageUrl = node.image?.sourceUrl || '';

  return {
    id: node.id,
    title: node.name || '',
    slug: node.slug || '',
    price,
    imageUrl,
    description: node.description || ''
  };
}

/**
 * Normalizes a single detailed product including image gallery and size variants.
 */
function normalizeProductDetail(node) {
  if (!node) return null;

  const baseProduct = normalizeProduct(node);

  let gallery = [];
  if (node.galleryImages?.nodes) {
    gallery = node.galleryImages.nodes.map(img => img.sourceUrl).filter(Boolean);
  }

  let variants = [];
  if (node.variations?.nodes) {
    variants = node.variations.nodes.map(v => ({
      id: v.id,
      name: v.name || '',
      price: v.price || v.regularPrice || baseProduct.price,
      attributes: v.attributes?.nodes || []
    }));
  }

  return {
    ...baseProduct,
    gallery,
    variants,
    categories: node.productCategories?.nodes?.map(c => ({ id: c.id, name: c.name, slug: c.slug })) || []
  };
}

/**
 * Fetch published products returning { products: Array, pageInfo: Object }.
 */
async function fetchProducts(first = 20, after = null) {
  const query = `
    query GetProducts($first: Int!, $after: String) {
      products(first: $first, after: $after, where: { status: "PUBLISH" }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          databaseId
          name
          slug
          description
          image {
            sourceUrl
            altText
          }
          ... on SimpleProduct {
            price
            regularPrice
            salePrice
          }
          ... on VariableProduct {
            price
            regularPrice
            salePrice
          }
        }
      }
    }
  `;

  const data = await graphQLClient(query, { first, after });
  const productConnection = data?.products || { nodes: [], pageInfo: {} };
  const products = (productConnection.nodes || []).map(normalizeProduct);

  return {
    products,
    pageInfo: productConnection.pageInfo || {}
  };
}

/**
 * Query a single canvas by slug returning full details, image gallery, and size variants.
 */
async function fetchProductBySlug(slug) {
  const query = `
    query GetProductBySlug($slug: ID!) {
      product(id: $slug, idType: SLUG) {
        id
        name
        slug
        description
        image {
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            sourceUrl
          }
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
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
        productCategories {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  `;

  const data = await graphQLClient(query, { slug });
  const productNode = data?.product;

  if (!productNode) {
    const error = new Error(`Product with slug "${slug}" not found`);
    error.statusCode = 404;
    throw error;
  }

  return normalizeProductDetail(productNode);
}

module.exports = {
  graphQLClient,
  fetchProducts,
  fetchProductBySlug,
  normalizeProduct,
  normalizeProductDetail
};