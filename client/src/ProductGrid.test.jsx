import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductGrid } from './components/ProductGrid';

describe('ProductGrid Component', () => {
  const mockProducts = [
    { id: 1, title: 'Abstract Smile Canvas', price: 49.99, slug: 'abstract-smile', imageUrl: 'https://example.com/1.jpg' },
    { id: 2, title: 'Cosmic Laughs Art', price: 89.50, slug: 'cosmic-laughs', imageUrl: 'https://example.com/2.jpg' },
  ];

  it('renders mock product titles and prices correctly', () => {
    render(<ProductGrid products={mockProducts} loading={false} error={null} />);

    expect(screen.getByText('Abstract Smile Canvas')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Laughs Art')).toBeInTheDocument();
    expect(screen.getByText('$89.50')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(<ProductGrid loading={true} />);
    expect(screen.getByText(/loading masterpieces/i)).toBeInTheDocument();
  });

  it('renders empty state correctly when no products provided', () => {
    render(<ProductGrid products={[]} loading={false} />);
    expect(screen.getByText(/no canvas artworks found/i)).toBeInTheDocument();
  });
});
