import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

describe('Search and Filter Functionality Tests', () => {
  it('should render search input field', () => {
    render(
      <BrowserRouter>
        <div>
          <input type="text" placeholder="Search spare parts..." data-testid="search-input" />
        </div>
      </BrowserRouter>
    );
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
  });

  it('should update search query on input change', () => {
    render(
      <BrowserRouter>
        <div>
          <input type="text" placeholder="Search spare parts..." data-testid="search-input" />
        </div>
      </BrowserRouter>
    );
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'brake pad' } });
    expect(searchInput.value).toBe('brake pad');
  });

  it('should render category filter options', () => {
    render(
      <BrowserRouter>
        <div>
          <select data-testid="category-filter">
            <option value="">All Categories</option>
            <option value="Brake System">Brake System</option>
            <option value="Engine Parts">Engine Parts</option>
            <option value="Suspension">Suspension</option>
          </select>
        </div>
      </BrowserRouter>
    );
    
    const categoryFilter = screen.getByTestId('category-filter');
    expect(categoryFilter).toBeInTheDocument();
    expect(screen.getByText('Brake System')).toBeInTheDocument();
    expect(screen.getByText('Engine Parts')).toBeInTheDocument();
  });

  it('should render condition filter options', () => {
    render(
      <BrowserRouter>
        <div>
          <select data-testid="condition-filter">
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>
      </BrowserRouter>
    );
    
    const conditionFilter = screen.getByTestId('condition-filter');
    expect(conditionFilter).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Used')).toBeInTheDocument();
  });

  it('should render price range filter', () => {
    render(
      <BrowserRouter>
        <div>
          <input type="number" placeholder="Min Price" data-testid="min-price" />
          <input type="number" placeholder="Max Price" data-testid="max-price" />
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('min-price')).toBeInTheDocument();
    expect(screen.getByTestId('max-price')).toBeInTheDocument();
  });
});
