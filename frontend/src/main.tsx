import './index.css'
import './Theme/AlertOverrides.css'
import './components/Loader/Loader.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import store from './redux/Store.ts';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <HelmetProvider>
        <GoogleOAuthProvider clientId="903968210580-qe4gosdi9acof4hutt3aeamro1bmj9a5.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </HelmetProvider>
    </Provider>
  </BrowserRouter>
);
