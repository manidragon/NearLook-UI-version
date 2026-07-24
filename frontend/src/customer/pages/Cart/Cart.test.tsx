import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Cart from './Cart';

// Mock Reducers for testing
import CartSlice from '../../../redux/Customer/CartSlice';
import AuthSlice from '../../../redux/Customer/AuthSlice';
import CouponSlice from '../../../redux/Customer/CouponSlice';

const renderWithProviders = (preloadedState = {}) => {
  const testStore = configureStore({
    reducer: {
      cart: CartSlice,
      auth: AuthSlice,
      coupon: CouponSlice,
    },
    preloadedState,
  });

  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    </Provider>
  );
};

describe('Cart Component', () => {
  it('renders empty cart state correctly', () => {
    renderWithProviders({
      cart: {
        cart: { cartItems: [] },
      },
    });

    expect(screen.getByText('Missing Cart items?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Shop Now/i })).toBeInTheDocument();
  });

  it('renders cart items and summary when cart has items', () => {
    const preloadedState = {
      cart: {
        cart: {
          cartItems: [
            {
              _id: 'item1',
              product: { _id: 'prod1', title: 'Test Product', sellingPrice: 500, mrpPrice: 1000 },
              quantity: 1,
              size: 'M',
            },
          ],
          totalSellingPrice: 500,
          totalMrpPrice: 1000,
        },
      },
    };

    renderWithProviders(preloadedState);

    // Verify Summary section
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText(/Price \(1 items\)/i)).toBeInTheDocument();
    expect(screen.getByText('₹1000')).toBeInTheDocument(); // MRP
    expect(screen.getByText('-₹500')).toBeInTheDocument(); // Discount

    // Verify Checkout button
    expect(screen.getByRole('button', { name: /Checkout/i })).toBeInTheDocument();
  });
});
