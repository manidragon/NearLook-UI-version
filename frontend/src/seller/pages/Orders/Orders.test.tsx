import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Orders from './Orders';

import sellerOrderSlice from '../../../redux/Seller/sellerOrderSlice';

const renderWithProviders = (preloadedState = {}) => {
  const testStore = configureStore({
    reducer: {
      sellerOrder: sellerOrderSlice,
    },
    preloadedState,
  });

  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    </Provider>
  );
};

describe('Seller Orders Component', () => {
  it('renders the orders table headers correctly', () => {
    renderWithProviders({
      sellerOrder: {
        orders: [],
        loading: false,
      },
    });

    expect(screen.getByText(/Loading orders.../i)).toBeInTheDocument();
  });
});
