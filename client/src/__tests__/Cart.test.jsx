import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { CartDrawer } from '../components/CartDrawer';
import { Navbar } from '../components/Navbar';
import { BrowserRouter } from 'react-router-dom';

function TestComponent() {
  const { addItem, items, itemCount, cartSubtotal } = useCart();
  return (
    <div>
      <button 
        onClick={() => addItem({ id: 'p1', title: 'Funny Tee', price: '$20.00', imageUrl: 'test.jpg' }, 1)}
        data-testid="add-btn"
      >
        Add Item
      </button>
      <div data-testid="item-count">{itemCount}</div>
      <div data-testid="subtotal">{cartSubtotal}</div>
    </div>
  );
}

describe('Cart Functionality & Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds an item and increments quantity without duplicate rows', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addBtn = screen.getByTestId('add-btn');
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    expect(screen.getByTestId('item-count').textContent).toBe('2');
    expect(screen.getByTestId('subtotal').textContent).toBe('40');
  });

  it('persists cart contents in localStorage and renders drawer with subtotal', () => {
    const preloaded = [{ id: 'p1', title: 'Funny Tee', price: '$25.00', imageUrl: 'test.jpg', quantity: 2 }];
    localStorage.setItem('chuckle_cart_items', JSON.stringify(preloaded));

    render(
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <CartDrawer />
        </BrowserRouter>
      </CartProvider>
    );

    // Badge should show 2
    expect(screen.getByTestId('cart-badge').textContent).toBe('2');

    // Open cart
    fireEvent.click(screen.getByLabelText('Open cart drawer'));

    // Check drawer renders title and subtotal
    expect(screen.getByText('Funny Tee')).toBeInTheDocument();
    expect(screen.getByTestId('cart-subtotal').textContent).toBe('$50.00');
  });

  it('removes item or decreases quantity to removal when reaching 0', () => {
    const preloaded = [{ id: 'p1', title: 'Funny Tee', price: '$20.00', imageUrl: 'test.jpg', quantity: 1 }];
    localStorage.setItem('chuckle_cart_items', JSON.stringify(preloaded));

    render(
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <CartDrawer />
        </BrowserRouter>
      </CartProvider>
    );

    fireEvent.click(screen.getByLabelText('Open cart drawer'));
    expect(screen.getByText('Funny Tee')).toBeInTheDocument();

    // Decrease quantity at 1 removes item
    fireEvent.click(screen.getByLabelText('Decrease quantity'));
    
    expect(screen.queryByText('Funny Tee')).not.toBeInTheDocument();
  });
});
