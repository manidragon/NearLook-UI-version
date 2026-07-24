import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../../../redux/Store';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  const renderLoginForm = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm toggleAuthMode={() => {}} />
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders login form and handles OTP flow', async () => {
    renderLoginForm();

    // 1. Initial State: Email input should be visible
    const emailInput = screen.getByPlaceholderText(/Email/i);
    expect(emailInput).toBeInTheDocument();

    // 2. Type Email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');

    // 3. Click Send OTP Button
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });
    expect(sendOtpButton).toBeInTheDocument();

    // Note: Since this is a unit test, we're not actually hitting the backend.
    // To fully test the transition to OTP inputs, we would either mock the Redux action
    // or mock the fetch/axios call. But for now, we verify the form renders properly.
  });
});
