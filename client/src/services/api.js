export const api = {
  async getProducts() {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return response.json();
  },

  async getProductBySlug(slug) {
    const response = await fetch(`/api/products/${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product ${slug}: ${response.statusText}`);
    }
    return response.json();
  }
};
