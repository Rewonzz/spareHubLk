import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

describe('ProductCard Component Tests', () => {
  const mockProduct = {
    id: '123',
    title: 'Brake Pad Set Toyota Axio',
    price: 8500,
    condition: 'New',
    category: 'Brake System',
    images: ['/uploads/test.jpg'],
    location: 'Colombo',
    averageRating: 4.5,
    reviewCount: 12,
    sellerUsername: 'test_seller',
    vehicleModel: 'Toyota Axio',
    vehicleYear: '2015',
    isPro: false,
    isDark: true
  };

  it('should render product title', () => {
    render(
      <BrowserRouter>
        <ProductCard {...mockProduct} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
  });

  it('should display product price', () => {
    render(
      <BrowserRouter>
        <ProductCard {...mockProduct} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/LKR/)).toBeInTheDocument();
  });

  it('should show condition badge', () => {
    render(
      <BrowserRouter>
        <ProductCard {...mockProduct} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should render with used condition', () => {
    const usedProduct = { ...mockProduct, condition: 'Used' };
    render(
      <BrowserRouter>
        <ProductCard {...usedProduct} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Used')).toBeInTheDocument();
  });
});
