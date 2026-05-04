# Frontend TODO

Build the Noor-e-ada ecommerce frontend against the existing backend API.

## Foundation

- [ ] Replace the default Vite starter screen with the Noor-e-ada app shell
- [ ] Decide final frontend routing library and route structure
- [ ] Add shared layout: header, navigation, footer, mobile menu
- [ ] Add environment config for backend API base URL
- [ ] Create API client with auth headers, refresh-token handling, and typed responses
- [ ] Add shared loading, empty, error, and success states
- [ ] Add reusable form controls and validation helpers
- [ ] Define core domain types: user, address, category, product, variant, cart, order, review, wishlist

## Auth

- [ ] Register page wired to `POST /api/auth/register`
- [ ] Login page wired to `POST /api/auth/login`
- [ ] Persist access token and refresh token safely on the client
- [ ] Refresh session using `POST /api/auth/refresh`
- [ ] Logout flow wired to `POST /api/auth/logout`
- [ ] Email verification result page for `GET /api/auth/verify-email`
- [ ] Resend verification form wired to `POST /api/auth/resend-verification`
- [ ] Forgot password page wired to `POST /api/auth/forgot-password`
- [ ] Reset password page wired to `POST /api/auth/reset-password`
- [ ] Protected routes for customer account and checkout
- [ ] Admin-only route guard using `GET /api/users/admin/access`

## Catalog

- [ ] Home page with featured ethnic wear sections
- [ ] Category listing wired to `GET /api/categories`
- [ ] Category detail page wired to `GET /api/categories/:categoryId`
- [ ] Product listing wired to `GET /api/products`
- [ ] Product search input using backend search query
- [ ] Filters for category, price, size, color, and other backend-supported product filters
- [ ] Sort controls for newest, price, and popularity
- [ ] Product detail page wired to `GET /api/products/:productId`
- [ ] Variant selector for size, color, material, price, compare-at price, and stock state
- [ ] Product image gallery using backend product image data
- [ ] Out-of-stock and low-stock UI states

## Cart & Checkout

- [ ] Cart page wired to `GET /api/cart`
- [ ] Add-to-cart flow wired to `POST /api/cart/items`
- [ ] Quantity update flow wired to `PUT /api/cart/items/:id`
- [ ] Remove item flow wired to `DELETE /api/cart/items/:id`
- [ ] Clear cart flow wired to `DELETE /api/cart`
- [ ] Coupon apply flow wired to `POST /api/cart/coupon`
- [ ] Coupon remove flow wired to `DELETE /api/cart/coupon`
- [ ] Cart totals UI with subtotal, discount, shipping, and final total
- [ ] Checkout address selection using saved addresses
- [ ] Checkout stock reservation wired to `POST /api/inventory/reservations/checkout`
- [ ] Place order flow wired to `POST /api/orders`
- [ ] Order success page after checkout
- [ ] Payment UI placeholder until backend payment provider is finalized

## Account

- [ ] Account profile page wired to `GET /api/users/me`
- [ ] Edit profile form wired to `PUT /api/users/me`
- [ ] Address book wired to `GET /api/users/addresses`
- [ ] Create address form wired to `POST /api/users/addresses`
- [ ] Update address form wired to `PUT /api/users/addresses/:addressId`
- [ ] Delete address action wired to `DELETE /api/users/addresses/:addressId`
- [ ] Default shipping and billing address controls
- [ ] Order history page wired to `GET /api/orders`
- [ ] Order details page wired to `GET /api/orders/:id`

## Wishlist

- [ ] Wishlist page wired to `GET /api/wishlist`
- [ ] Add wishlist button wired to `POST /api/wishlist`
- [ ] Remove wishlist item wired to `DELETE /api/wishlist/:id`
- [ ] Reflect wishlist state on product cards and product detail page

## Reviews

- [ ] Product reviews section wired to `GET /api/products/:productId/reviews`
- [ ] Submit review form wired to `POST /api/products/:productId/reviews`
- [ ] Rating summary UI using average rating from product listing/details
- [ ] Auth-required state for review submission

## Admin

- [ ] Admin dashboard shell
- [ ] Admin product list wired to `GET /api/products`
- [ ] Create product form wired to `POST /api/products`
- [ ] Update product form wired to `PUT /api/products/:productId`
- [ ] Product image upload wired to `POST /api/products/images/upload`
- [ ] Admin category create/update forms wired to `POST /api/categories` and `PUT /api/categories/:categoryId`
- [ ] Low-stock inventory page wired to `GET /api/inventory/low-stock`
- [ ] Admin order list page
- [ ] Update order status flow wired to `PATCH /api/orders/:id/status`

## Quality & Release

- [ ] Add frontend `.env.example`
- [ ] Add lint and build checks to the regular workflow
- [ ] Add basic component tests for forms and shared components
- [ ] Add API integration smoke tests for auth, catalog, cart, and checkout
- [ ] Check responsive layouts for mobile, tablet, and desktop
- [ ] Check accessibility for forms, navigation, dialogs, and buttons
- [ ] Replace default Vite/React assets and links
