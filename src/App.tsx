import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

import { HomePage } from './pages/HomePage';
import { ContactPage } from './pages/ContactPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { ShippingPage } from './pages/ShippingPage';
import { SizeGuidePage } from './pages/SizeGuidePage';
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
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

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
          <Route path="/admin/login"          element={<AdminLoginPage />} />

          {/* ── Standalone admin console ── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/:section" element={<AdminDashboardPage />} />
          </Route>

          {/* ── Main app shell ── */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route
              path="/new-arrivals"
              element={(
                <ProductListPage
                  eyebrow="Fresh from Noor-e-ada"
                  title="New Arrivals"
                  description="new styles ready for weddings, festivals, and everyday elegance."
                  defaultSort="newest"
                />
              )}
            />
            <Route
              path="/bestsellers"
              element={(
                <ProductListPage
                  eyebrow="Customer favourites"
                  title="Bestsellers"
                  description="popular styles customers are saving, reviewing, and adding to cart."
                  defaultSort="popularity"
                />
              )}
            />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/collections" element={<CategoryListPage />} />
            <Route path="/collections/:id" element={<CategoryDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Customer-only routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/account"  element={<AccountPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/orders"   element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
