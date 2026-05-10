# Frontend TODO

Build the Noor-e-ada ecommerce frontend against the backend API.

## Foundation

- [x] Replace the default Vite starter screen with the Noor-e-ada app shell
- [x] Decide final frontend routing library and route structure
- [x] Add shared layout: header, navigation, footer, mobile menu
- [x] Add environment config for backend API base URL
- [x] Create API client with auth headers, refresh-token handling, and typed responses
- [x] Add shared loading, empty, error, and success states
- [x] Add reusable form controls and validation helpers
- [x] Define core domain types: user, address, category, product, variant, cart, order, review, wishlist

## Auth

- [x] Add auth service wrapper for register/login/logout/refresh
- [x] Add `AuthProvider` with current user, auth status, login, register, logout
- [x] Add backend-to-frontend user mapper
- [x] Register page wired to `POST /api/auth/register`
- [x] Login page wired to `POST /api/auth/login`
- [x] Persist access token and refresh token safely on the client
- [x] Refresh session using `POST /api/auth/refresh`
- [x] Logout flow wired to `POST /api/auth/logout`
- [x] Email verification result page for `GET /api/auth/verify-email`
- [x] Resend verification form wired to `POST /api/auth/resend-verification`
- [x] Forgot password page wired to `POST /api/auth/forgot-password`
- [x] Reset password page wired to `POST /api/auth/reset-password`
- [x] Protected routes for customer account and checkout
- [x] Admin-only route guard using `GET /api/users/admin/access`

## Catalog

- [x] Home page with featured ethnic wear sections
- [x] Category listing wired to `GET /api/categories`
- [x] Category detail page wired to `GET /api/categories/:categoryId`
- [x] Product listing wired to `GET /api/products`
- [x] Product search input using backend search query
- [x] Filters for category, price, size, color, and other backend-supported product filters
- [x] Sort controls for newest, price, and popularity
- [x] Product detail page wired to `GET /api/products/:productId`
- [x] Variant selector for size, color, material, price, compare-at price, and stock state
- [x] Product image gallery using backend product image data
- [x] Out-of-stock and low-stock UI states

## Cart & Checkout

- [x] Cart page wired to `GET /api/cart`
- [x] Add-to-cart flow wired to `POST /api/cart/items`
- [x] Quantity update flow wired to `PUT /api/cart/items/:id`
- [x] Remove item flow wired to `DELETE /api/cart/items/:id`
- [x] Clear cart flow wired to `DELETE /api/cart`
- [x] Coupon apply flow wired to `POST /api/cart/coupon`
- [ ] Coupon remove UX after backend adds a remove-coupon endpoint
- [x] Cart totals UI with subtotal, discount, shipping, and final total
- [x] Checkout address selection using saved addresses
- [x] Checkout stock reservation wired to `POST /api/inventory/reservations/checkout`
- [x] Place order flow wired to `POST /api/orders`
- [x] Razorpay order creation wired to `POST /api/payments/create-order`
- [x] Razorpay payment verification wired to `POST /api/payments/verify`
- [x] Order success page after checkout
- [x] Payment failed/cancelled state for Razorpay checkout

## Account

- [x] Account profile page wired to `GET /api/users/me`
- [x] Edit profile form wired to `PUT /api/users/me`
- [x] Address book wired to `GET /api/users/addresses`
- [x] Create address form wired to `POST /api/users/addresses`
- [x] Update address form wired to `PUT /api/users/addresses/:addressId`
- [x] Delete address action wired to `DELETE /api/users/addresses/:addressId`
- [x] Default shipping and billing address controls
- [x] Order history page wired to `GET /api/orders`
- [x] Order details page wired to `GET /api/orders/:id`

## Wishlist

- [x] Wishlist page wired to `GET /api/wishlist`
- [x] Add wishlist button wired to `POST /api/wishlist`
- [x] Remove wishlist item wired to `DELETE /api/wishlist/:id`
- [x] Reflect wishlist state on product cards and product detail page

## Reviews

- [x] Product reviews section wired to `GET /api/products/:productId/reviews`
- [x] Submit review form wired to `POST /api/products/:productId/reviews`
- [x] Rating summary UI using average rating from product listing/details
- [x] Auth-required state for review submission

## Admin

- [ ] Admin dashboard shell
- [ ] Admin product list wired to `GET /api/products?all=true`
- [ ] Create product form wired to `POST /api/products`
- [ ] Update product form wired to `PUT /api/products/:productId`
- [ ] Delete product action wired to `DELETE /api/products/:productId`
- [ ] Bulk product active/inactive action wired to `PATCH /api/products/bulk/status`
- [ ] Bulk product delete action wired to `DELETE /api/products/bulk`
- [ ] Product image upload wired to `POST /api/products/images/upload`
- [ ] Admin category create/update forms wired to `POST /api/categories` and `PUT /api/categories/:categoryId`
- [ ] Admin category delete action wired to `DELETE /api/categories/:categoryId`
- [ ] Low-stock inventory page wired to `GET /api/inventory/low-stock`
- [ ] Admin order list page wired to `GET /api/orders/admin`
- [ ] Admin order filters for search, status, user, page, and limit
- [ ] Admin order detail page wired to `GET /api/orders/admin/:id`
- [ ] Update order status flow wired to `PATCH /api/orders/:id/status`
- [ ] Admin user list wired to `GET /api/users/admin/users`
- [ ] Admin user filters for search, role, page, and limit
- [ ] Admin user role update wired to `PATCH /api/users/admin/users/:userId/role`
- [ ] Admin user active/inactive toggle wired to `PATCH /api/users/admin/users/:userId/active`

## Backend Integration Notes

- [ ] Decide whether frontend needs a coupon remove action; backend currently has `POST /api/cart/coupon` but no remove-coupon route
- [ ] Razorpay webhook is backend-only at `POST /api/payments/webhook`; no frontend screen needed unless admin payment logs are added

## Quality & Release

- [ ] Add frontend `.env.example`
- [ ] Add lint and build checks to the regular workflow
- [ ] Add basic component tests for forms and shared components
- [ ] Add API integration smoke tests for auth, catalog, cart, and checkout
- [ ] Check responsive layouts for mobile, tablet, and desktop
- [ ] Check accessibility for forms, navigation, dialogs, and buttons
- [ ] Replace default Vite/React assets and links
