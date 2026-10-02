const express = require('express');

const router = express.Router();

// POST /api/orders
router.post('/', (req, res, next) => {
  try {
    const { customer, items, total } = req.body || {};

    // Validate customer details
    if (!customer || !customer.name || !customer.email || !customer.address) {
      return res.status(400).json({
        error: {
          message: 'Missing required customer details (name, email, address)',
          status: 400
        }
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: {
          message: 'Order must contain at least one item',
          status: 400
        }
      });
    }

    // Generate random 5-digit alphanumeric orderId
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `CHK-${randomSuffix}`;

    const timestamp = new Date().toISOString();

    res.status(201).json({
      orderId,
      status: 'received',
      timestamp
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
