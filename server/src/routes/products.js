const express = require('express');
const { fetchProducts, fetchProductBySlug } = require('../services/cms');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const result = await fetchProducts();
    res.status(200).json({ products: result.products });
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
