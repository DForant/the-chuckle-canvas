/**
 * API service helper for client workspace.
 * Consumes GET /api/products via local Vite proxy (port 4000).
 */

const API_BASE = ''; // Relies on Vite proxy for /api requests

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/api/products`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error?.message || `Failed to fetch products (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function fetchProductDetail(slug) {
  const response = await fetch(`${API_BASE}/api/products/${slug}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error?.message || `Failed to fetch product detail (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
