import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App.jsx';

describe('App Smoke Test', () => {
  it('renders title and heading correctly', () => {
    render(<App />);
    const headingElements = screen.getAllByText(/The Chuckle Canvas/i);
    expect(headingElements.length).toBeGreaterThan(0);
  });
});
