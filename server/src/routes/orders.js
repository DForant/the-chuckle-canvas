const express = require('express');

const router = express.Router();

// POST /api/orders
router.post('/', (req, res, next) => {
  try {
    const { customer, items, total, payment } = req.body || {};

    // Validate customer details & required fields requested by requirements
    if (
      !customer ||
      !customer.firstName ||
      !customer.lastName ||
      !customer.email ||
      !customer.shippingAddress1 ||
      !customer.shippingCity ||
      !customer.shippingState ||
      !customer.shippingZip
    ) {
      return res.status(400).json({
        error: {
          message: 'Missing required customer shipping details (First Name, Last Name, Email Address, Shipping Address 1, City, State, Zip code)',
          status: 400
        }
      });
    }

    // Validate payment details
    if (
      !payment ||
      !payment.cardNumber ||
      !payment.expirationDate ||
      !payment.cvcCode
    ) {
      return res.status(400).json({
        error: {
          message: 'Missing required payment details (Card Number, Expiration Date, CVC Code)',
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
      timestamp,
      customer,
      items,
      total: total || '0.00'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
