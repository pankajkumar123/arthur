# Controllers Directory

Controllers handle business logic and request/response flow.

Each controller should:
1. Parse request data
2. Call database/services
3. Format and return response

Example structure:
```
controllers/
├── authController.js
├── productController.js
├── cartController.js
└── orderController.js
```

Each controller exports named functions like:
- `getProducts`
- `createOrder`
- `updateCart`
- etc.
