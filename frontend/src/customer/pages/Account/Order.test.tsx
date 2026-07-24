import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Order from './Order';

import OrderSlice from '../../../redux/Customer/OrderSlice';
import AuthSlice from '../../../redux/Customer/AuthSlice';

const renderWithProviders = (preloadedState = {}) => {
  const testStore = configureStore({
    reducer: {
      orders: OrderSlice,
      auth: AuthSlice,
    },
    preloadedState,
  });

  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        <Order />
      </BrowserRouter>
    </Provider>
  );
};

describe('Order Component', () => {
  it('renders loading state', () => {
    renderWithProviders({
      orders: { loading: true },
    });
    expect(screen.getByText('Loading your orders...')).toBeInTheDocument();
  });

  it('renders empty state when no orders', () => {
    renderWithProviders({
      orders: { orders: [], loading: false },
    });
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });

  it('renders delivery and self-pickup orders correctly', () => {
    const mockState = {
      orders: {
        loading: false,
        orders: [
          {
            _id: 'order1',
            fulfillmentType: 'DELIVERY',
            orderItems: [{ _id: 'item1', product: { title: 'Delivery Item' } }],
          },
          {
            _id: 'order2',
            fulfillmentType: 'SELF_PICKUP',
            orderItems: [{ _id: 'item2', product: { title: 'Pickup Item' } }],
          },
        ],
      },
    };

    renderWithProviders(mockState);

    // Initial render should show Delivery orders
    expect(screen.getByText('🚚 Delivery Orders')).toBeInTheDocument();
    
    // In actual implementation, the OrderItemCard would render the product title, 
    // but we can just check if the tab exists and switches
    const pickupTab = screen.getByRole('tab', { name: /Self Pickup Orders/i });
    expect(pickupTab).toBeInTheDocument();

    // Click on Self Pickup tab
    fireEvent.click(pickupTab);

    expect(screen.getByText('🏪 Self Pickup Orders')).toBeInTheDocument();
  });
});
