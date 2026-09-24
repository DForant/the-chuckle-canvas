import { useState, useEffect } from 'react';

/**
 * Fetch products catalog from GET /api/products
 * @returns {Promise<{ products: Array, pageInfo: Object }>}
 */
export async function fetchProductsApi() {
  const response = await fetch('/api/products', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}
