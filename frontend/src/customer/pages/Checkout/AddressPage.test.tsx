import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AddressPage from './AddressPage';

import CartSlice from '../../../redux/Customer/CartSlice';
import AuthSlice from '../../../redux/Customer/AuthSlice';
import UserSlice from '../../../redux/Customer/UserSlice';

// Mock matchMedia which is required by MUI or DatePickers sometimes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

const renderWithProviders = (preloadedState = {}) => {
  const testStore = configureStore({
    reducer: {
      cart: CartSlice,
      auth: AuthSlice,
      user: UserSlice,
    },
    preloadedState,
  });

  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        <AddressPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('AddressPage Component', () => {
  it('renders checkout summary and fulfillment options', () => {
    const preloadedState = {
      cart: {
        cart: {
          cartItems: [{ _id: 'item1', quantity: 1 }],
          totalSellingPrice: 500,
          totalMrpPrice: 1000,
        },
      },
      user: {
        user: {
          addresses: [
            {
              _id: 'addr1',
              name: 'John Doe',
              mobile: '1234567890',
              address: '123 Test St',
              city: 'Test City',
              state: 'Test State',
              zipCode: '123456',
            },
          ],
        },
      },
    };

    renderWithProviders(preloadedState);

    // Verify main headers
    expect(screen.getByText('1. Fulfillment Options')).toBeInTheDocument();
    expect(screen.getByText('2. Fulfillment Type')).toBeInTheDocument();
    expect(screen.getByText('3. Payment Method')).toBeInTheDocument();

    // Verify User Address is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/123 Test St/)).toBeInTheDocument();

    // Verify Payment Options
    expect(screen.getByText('Razorpay')).toBeInTheDocument();
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();

    // Verify Summary
    expect(screen.getByText('PLACE ORDER')).toBeInTheDocument();
  });
});
