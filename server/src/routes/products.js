const express = require('express');
const { fetchProducts, fetchProductBySlug } = require('../services/cms');

const router = express.Router();

const FALLBACK_PRODUCTS = [
  {
    id: "prod_1",
    title: "Chuckle Canvas Signature Smile",
    slug: "chuckle-canvas-signature-smile",
    price: "$29.99",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
    description: "Our classic high-quality wrapped canvas guaranteed to bring a smile to any room."
  },
  {
    id: "prod_2",
    title: "Witty Wit & Wall Art",
    slug: "witty-wit-and-wall-art",
    price: "$34.99",
    imageUrl: "https://images.unsplash.com/photo-1582561234149-14a0fc867623?w=600&auto=format&fit=crop&q=80",
    description: "A brilliant blend of art and humor for your workspace or living room."
  },
  {
    id: "prod_3",
    title: "Laugh Out Loud Abstract",
    slug: "laugh-out-loud-abstract",
    price: "$39.99",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80",
    description: "Vibrant colors meet playful abstraction in this premium gallery-grade canvas."
  },
  {
    id: "prod_4",
    title: "Daily Dose of Joy",
    slug: "daily-dose-of-joy",
    price: "$24.99",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",
    description: "Brighten your mornings with this uplifting canvas print."
  }
];

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const result = await fetchProducts();
    if (!result || !result.products || result.products.length === 0) {
      return res.status(200).json({
        products: FALLBACK_PRODUCTS,
        pageInfo: { hasNextPage: false, endCursor: null }
      });
    }
    res.status(200).json(result);
  } catch (err) {
    console.warn('CMS unreachable during catalog fetch, serving fallback mock products:', err.message);
    res.status(200).json({
      products: FALLBACK_PRODUCTS,
      pageInfo: { hasNextPage: false, endCursor: null }
    });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;
  try {
    const product = await fetchProductBySlug(slug);
    if (!product) {
      const fallback = FALLBACK_PRODUCTS.find(p => p.slug === slug);
      if (fallback) {
        return res.status(200).json({ ...fallback, gallery: [fallback.imageUrl], variants: [], categories: [] });
      }
      return res.status(404).json({ error: { message: 'Product not found', status: 404 } });
    }
    res.status(200).json(product);
  } catch (err) {
    const fallback = FALLBACK_PRODUCTS.find(p => p.slug === slug);
    if (fallback) {
      return res.status(200).json({ ...fallback, gallery: [fallback.imageUrl], variants: [], categories: [] });
    }
    if (err.statusCode === 404 || (err.message && err.message.toLowerCase().includes('not found'))) {
      return res.status(404).json({ error: { message: err.message || 'Product not found', status: 404 } });
    }
    next(err);
  }
});

module.exports = router;
