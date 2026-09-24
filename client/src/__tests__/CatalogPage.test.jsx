import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CatalogPage from '../pages/CatalogPage';

describe('CatalogPage & ProductGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state and then populates products grid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [
          {
            id: 'prod_1',
            title: 'Test Canvas Print',
            slug: 'test-canvas-print',
            price: '$29.99',
            imageUrl: 'https://example.com/image.jpg',
            description: 'A test canvas description'
          }
        ],
        pageInfo: { hasNextPage: false, endCursor: null }
      })
    });

    render(<CatalogPage />);

    expect(screen.getByText(/Explore Our Chuckling Canvas Collection/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Canvas Print')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });
  });
});
