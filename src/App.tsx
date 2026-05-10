import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ResendVerificationPage } from './pages/auth/ResendVerificationPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AccountPage } from './pages/account/AccountPage';
import { OrdersPage } from './pages/account/OrdersPage';
import { OrderDetailsPage } from './pages/account/OrderDetailsPage';
import { CategoryDetailPage } from './pages/catalog/CategoryDetailPage';
import { CategoryListPage } from './pages/catalog/CategoryListPage';
import { ProductDetailPage } from './pages/catalog/ProductDetailPage';
import { ProductListPage } from './pages/catalog/ProductListPage';
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/cart/CheckoutPage';
import { OrderSuccessPage } from './pages/cart/OrderSuccessPage';
import { WishlistPage } from './pages/wishlist/WishlistPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Standalone auth pages (no AppLayout) ── */}
          <Route path="/login"                element={<LoginPage />} />
          <Route path="/register"             element={<RegisterPage />} />
          <Route path="/verify-email"         element={<VerifyEmailPage />} />
          <Route path="/resend-verification"  element={<ResendVerificationPage />} />
          <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
          <Route path="/reset-password"       element={<ResetPasswordPage />} />

          {/* ── Main app shell ── */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/collections" element={<CategoryListPage />} />
            <Route path="/collections/:id" element={<CategoryDetailPage />} />

            {/* Customer-only routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/account"  element={<AccountPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/orders"   element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div className="auth-page"><p>Admin (coming soon)</p></div>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
