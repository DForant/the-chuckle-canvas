const express = require('express');
const { fetchProducts, fetchProductBySlug } = require('../services/cms');

const router = express.Router();

function deduplicate(products = []) {
  const seen = new Set();
  return products.filter((item) => {
    const key = item.id || item.slug;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const result = await fetchProducts();
    const uniqueProducts = deduplicate(result?.products || []);
    res.status(200).json({ products: uniqueProducts });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await fetchProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: { message: 'Product not found', status: 404 } });
    }
    res.status(200).json(product);
  } catch (err) {
    if (err.statusCode === 404 || (err.message && err.message.toLowerCase().includes('not found'))) {
      return res.status(404).json({ error: { message: err.message || 'Product not found', status: 404 } });
    }
    next(err);
  }
});

module.exports = router;