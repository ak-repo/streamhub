# API Services Documentation

This directory contains all the API service functions for the FreshBox ecommerce application.

## Services Overview

### Authentication Services (`authService.js`)

- User login and registration
- Token management
- Password reset functionality

### Cart Services (`cartService.js`)

- Add items to cart
- Remove items from cart
- Get cart contents
- Update cart quantities

### Product Services (`productService.js`)

- Get all products
- Get product by ID
- Search products
- Filter products by category

### Profile Services (`profileService.js`)

- Get user profile
- Update user profile
- Manage user addresses
- Change password

### Wishlist Services (`wishlistService.js`)

- Add items to wishlist
- Remove items from wishlist
- Get wishlist contents
- Clear entire wishlist

### Order Services (`orderService.js`)

- Create new orders
- Get order history
- Get order by ID
- Update order status
- Cancel orders

### Checkout Services (`checkoutService.js`)

- Validate checkout data
- Process payments
- Get shipping options
- Apply/remove coupons

### Contact Services (`contactService.js`)

- Send contact messages
- Get contact information
- Get FAQ data

## API Configuration

The base API configuration is in `api.js`:

- Base URL: `http://localhost:8080/api/v1/customer`
- Automatic token injection from localStorage
- Request/response interceptors for data transformation
- Cookie support for authentication

## Usage Examples

```javascript
// Import specific services
import { getProducts, addToCartService } from "../api";

// Or import from index
import { getProducts, addToCartService } from "../api/index";

// Use in components
const products = await getProducts();
await addToCartService({ product_id: 1, quantity: 2 });
```

## Error Handling

All services include proper error handling and logging. Errors are thrown and should be caught in the calling components:

```javascript
try {
  const data = await getProducts();
  setProducts(data);
} catch (error) {
  console.error("Error fetching products:", error);
  // Handle error appropriately
}
```

## Backend Integration

These services are designed to work with a REST API backend. The expected endpoints are:

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /auth/cart` - Add to cart
- `GET /auth/cart` - Get cart contents
- `DELETE /auth/cart` - Remove from cart
- `POST /wishlist` - Add to wishlist
- `GET /wishlist` - Get wishlist
- `DELETE /wishlist` - Remove from wishlist
- `POST /orders` - Create order
- `GET /orders` - Get orders
- `POST /checkout/validate` - Validate checkout
- `POST /checkout/payment` - Process payment
- `POST /contact` - Send contact message

## Development Notes

- All services use async/await for promise handling
- Services include fallback data for development/demo purposes
- Error messages are logged to console for debugging
- Services are designed to be easily testable and mockable

