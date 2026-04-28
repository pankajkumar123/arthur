# Test Files Directory

Backend tests should be organized as:
- Unit tests: Test individual functions/utilities
- Integration tests: Test API endpoints with database
- E2E tests: Test full user workflows

Files should be named with `.test.js` or `.spec.js` extension.

Example structure:
```
tests/
├── unit/
│   ├── utils.test.js
│   └── validators.test.js
├── integration/
│   ├── auth.test.js
│   ├── products.test.js
│   └── orders.test.js
└── e2e/
    └── checkout.test.js
```
