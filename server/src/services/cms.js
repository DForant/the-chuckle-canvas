const fetch = require('node-fetch');

/**
 * Lightweight GraphQL client function for querying WPGraphQL.
 * 
 * @param {string} query - GraphQL query or mutation string.
 * @param {Object} [variables={}] - Query variables.
 * @param {Object} [headers={}] - Additional headers (e.g. woocommerce-session).
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
    const error = new Error(result.message || `GraphQL request failed with status ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map(e => e.message).join(', ');
    const error = new Error(`GraphQL Error: ${errorMessages}`);
    // Check if error is related to not found (e.g. product not found)
    if (errorMessages.toLowerCase().includes('not found') || errorMessages.toLowerCase().includes('does not exist')) {
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

  // Handle WPGraphQL price formats (e.g., "$19.99" or formatted string or numeric)
  let price = node.price || node.regularPrice || node.salePrice || '0.00';
  if (node.rawPrice) {
    price = node.rawPrice;
  }

  // Handle image URL from featuredImage
  let imageUrl = node.image?.sourceUrl || node.featuredImage?.node?.sourceUrl || '';

  return {
    id: node.id,
    title: node.title || node.name || '',
    slug: node.slug || '',
    price,
    imageUrl,
    description: node.description || node.shortDescription || ''
  };
}

/**
 * Normalizes a single detailed product including image gallery and size variants.
 */
function normalizeProductDetail(node) {
  if (!node) return null;

  const baseProduct = normalizeProduct(node);

  // Gallery images
  let gallery = [];
  if (node.galleryImages?.nodes) {
    gallery = node.galleryImages.nodes.map(img => img.sourceUrl).filter(Boolean);
  } else if (node.imageGallery?.nodes) {
    gallery = node.imageGallery.nodes.map(img => img.sourceUrl).filter(Boolean);
  }

  // Variants (e.g., variable products or attributes)
  let variants = [];
  if (node.variants?.nodes) {
    variants = node.variants.nodes.map(v => ({
      id: v.id,
      name: v.name || v.title || '',
      price: v.price || v.regularPrice || baseProduct.price,
      attributes: v.attributes?.nodes || v.attributes || []
    }));
  } else if (node.attributes?.nodes) {
    variants = node.attributes.nodes.map(attr => ({
      id: attr.id || attr.name,
      name: attr.name,
      options: attr.options || []
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
 * Fetch published products returning { id, title, slug, price, imageUrl, description }.
 * 
 * @param {number} [first=20] - Number of products to fetch.
 * @param {string} [after] - Cursor for pagination.
 * @returns {Promise<{ products: Array, pageInfo: Object }>}
 */
async function fetchProducts(first = 20, after = null) {
  const query = `
    query GetProducts($first: Int!, $after: String) {
      products(first: $first, after: $after, where: { status: "PUBLISH" }) {
        nodes {
          id
          title
          slug
          price
          regularPrice
          salePrice
          description
          shortDescription
          featuredImage {
            node {
              sourceUrl
            }
          }
          image {
            sourceUrl
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const data = await graphQLClient(query, { first, after });
  const productConnection = data.products || { nodes: [], pageInfo: {} };
  
  const products = (productConnection.nodes || []).map(normalizeProduct);

  return {
    products,
    pageInfo: productConnection.pageInfo || {}
  };
}

/**
 * Query a single canvas by slug returning full details, image gallery, and size variants.
 * 
 * @param {string} slug - Product slug.
 * @returns {Promise<Object|null>}
 */
async function fetchProductBySlug(slug) {
  const query = `
    query GetProductBySlug($slug: ID!) {
      product(id: $slug, idType: SLUG) {
        id
        title
        slug
        price
        regularPrice
        salePrice
        description
        shortDescription
        featuredImage {
          node {
            sourceUrl
          }
        }
        image {
          node {
            sourceUrl
          }
        }
        galleryImages {
          nodes {
            sourceUrl
          }
        }
        imageGallery {
          nodes {
            sourceUrl
          }
        }
        variants {
          nodes {
            id
            name
            price
            regularPrice
          }
        }
        attributes {
          nodes {
            id
            name
            options
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
  const productNode = data.product;

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
