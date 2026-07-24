import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Products from './Products';

import sellerProductSlice from '../../../redux/Seller/sellerProductSlice';

const renderWithProviders = (preloadedState = {}) => {
  const testStore = configureStore({
    reducer: {
      sellerProduct: sellerProductSlice,
    },
    preloadedState,
  });

  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    </Provider>
  );
};

describe('Seller Products Component', () => {
  it('renders the products list correctly', () => {
    renderWithProviders({
      sellerProduct: {
        products: [],
        loading: false,
      },
    });

    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });
});
