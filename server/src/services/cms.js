import fetch from "node-fetch";

export class ProductNotFoundError extends Error {
  constructor(message = "Product not found") {
    super(message);
    this.name = "ProductNotFoundError";
    this.status = 404;
  }
}

export const MEDIA_ITEM_FRAGMENT = `
  fragment MediaItemFragment on MediaItem {
    id
    sourceUrl
    altText
  }
`;

export const PRODUCT_PRICING_FRAGMENT = `
  fragment ProductPricingFragment on Product {
    ... on SimpleProduct {
      price(format: FORMATTED)
      rawPrice: price(format: RAW)
      regularPrice(format: FORMATTED)
      salePrice(format: FORMATTED)
      onSale
      stockStatus
      stockQuantity
    }
    ... on VariableProduct {
      price(format: FORMATTED)
      rawPrice: price(format: RAW)
      regularPrice(format: FORMATTED)
      salePrice(format: FORMATTED)
      onSale
      stockStatus
    }
  }
`;

export const VARIATION_NODE_FRAGMENT = `
  fragment VariationNodeFragment on ProductVariation {
    id
    databaseId
    name
    price(format: FORMATTED)
    regularPrice(format: FORMATTED)
    salePrice(format: FORMATTED)
    stockStatus
    stockQuantity
    attributes {
      nodes {
        name
        value
        label
      }
    }
    image {
      ...MediaItemFragment
    }
  }
`;

export const GET_PRODUCT_BY_SLUG_QUERY = `
  ${MEDIA_ITEM_FRAGMENT}
  ${PRODUCT_PRICING_FRAGMENT}
  ${VARIATION_NODE_FRAGMENT}

  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      slug
      name
      description
      shortDescription
      ...ProductPricingFragment
      image {
        ...MediaItemFragment
      }
      galleryImages {
        nodes {
          ...MediaItemFragment
        }
      }
      productCategories {
        nodes {
          id
          databaseId
          name
          slug
        }
      }
      ... on VariableProduct {
        variations(first: 50) {
          nodes {
            ...VariationNodeFragment
          }
        }
      }
    }
  }
`;

export async function executeGraphQLQuery(query, variables) {
  const endpoint = process.env.WP_GRAPHQL_URL;
  if (!endpoint) {
    throw new Error("WP_GRAPHQL_URL environment variable is not defined");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Upstream CMS network error: ${res.statusText}`);
  }

  return await res.json();
}

export function mapWooCommerceProduct(product) {
  if (!product) return null;

  return {
    id: product.id,
    databaseId: product.databaseId,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price || null,
    regularPrice: product.regularPrice || null,
    salePrice: product.salePrice || null,
    onSale: Boolean(product.onSale),
    stockStatus: product.stockStatus || null,
    stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : null,
    featuredImage: product.image
      ? {
          id: product.image.id,
          sourceUrl: product.image.sourceUrl,
          altText: product.image.altText || null,
        }
      : null,
    galleryImages:
      product.galleryImages && product.galleryImages.nodes
        ? product.galleryImages.nodes.map((img) => ({
            id: img.id,
            sourceUrl: img.sourceUrl,
            altText: img.altText || null,
          }))
        : [],
    categories:
      product.productCategories && product.productCategories.nodes
        ? product.productCategories.nodes.map((cat) => ({
            id: cat.id,
            databaseId: cat.databaseId,
            name: cat.name,
            slug: cat.slug,
          }))
        : [],
    variations:
      product.variations && product.variations.nodes
        ? product.variations.nodes.map((v) => ({
            id: v.id,
            databaseId: v.databaseId,
            name: v.name,
            price: v.price || null,
            regularPrice: v.regularPrice || null,
            salePrice: v.salePrice || null,
            stockStatus: v.stockStatus || null,
            stockQuantity: v.stockQuantity !== undefined ? v.stockQuantity : null,
            attributes:
              v.attributes && v.attributes.nodes
                ? v.attributes.nodes.map((attr) => ({
                    name: attr.name,
                    value: attr.value,
                    label: attr.label,
                  }))
                : [],
            image: v.image
              ? {
                  id: v.image.id,
                  sourceUrl: v.image.sourceUrl,
                  altText: v.image.altText || null,
                }
              : null,
          }))
        : [],
  };
}

export async function fetchProductBySlug(slug) {
  const response = await executeGraphQLQuery(GET_PRODUCT_BY_SLUG_QUERY, { slug });

  if (response.errors && Array.isArray(response.errors)) {
    const hasNotFoundError = response.errors.some(
      (err) => typeof err.message === "string" && err.message.includes("No product ID was found")
    );

    if (hasNotFoundError) {
      throw new ProductNotFoundError();
    }

    throw new Error(response.errors.map((e) => e.message).join(", "));
  }

  if (!response.data || !response.data.product) {
    throw new ProductNotFoundError();
  }

  return mapWooCommerceProduct(response.data.product);
}
