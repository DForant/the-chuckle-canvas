import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from '../pages/CheckoutPage';
import { CartProvider } from '../context/CartContext';

// We can test the CheckoutPage & Order Confirmation flow
describe('Checkout & Order Confirmation', () => {
  it('renders empty cart message when no items in cart', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Your cart is empty/i)).toBeDefined();
  });
});
