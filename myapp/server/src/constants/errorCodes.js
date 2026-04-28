/**
 * HTTP Error Codes & Messages
 * Standardized error responses
 */

const ERROR_CODES = {
  // 400 errors
  BAD_REQUEST: { code: 400, message: 'Bad Request' },
  VALIDATION_ERROR: { code: 400, message: 'Validation Error' },
  INVALID_INPUT: { code: 400, message: 'Invalid Input' },
  
  // 401 errors
  UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
  INVALID_TOKEN: { code: 401, message: 'Invalid Token' },
  TOKEN_EXPIRED: { code: 401, message: 'Token Expired' },
  NO_TOKEN: { code: 401, message: 'No Token Provided' },
  
  // 403 errors
  FORBIDDEN: { code: 403, message: 'Forbidden' },
  INSUFFICIENT_PERMISSIONS: { code: 403, message: 'Insufficient Permissions' },
  
  // 404 errors
  NOT_FOUND: { code: 404, message: 'Not Found' },
  RESOURCE_NOT_FOUND: { code: 404, message: 'Resource Not Found' },
  USER_NOT_FOUND: { code: 404, message: 'User Not Found' },
  PRODUCT_NOT_FOUND: { code: 404, message: 'Product Not Found' },
  ORDER_NOT_FOUND: { code: 404, message: 'Order Not Found' },
  
  // 409 errors
  CONFLICT: { code: 409, message: 'Conflict' },
  USER_EXISTS: { code: 409, message: 'User Already Exists' },
  DUPLICATE_ENTRY: { code: 409, message: 'Duplicate Entry' },
  
  // 500 errors
  INTERNAL_ERROR: { code: 500, message: 'Internal Server Error' },
  DATABASE_ERROR: { code: 500, message: 'Database Error' },
  
  // 503 errors
  SERVICE_UNAVAILABLE: { code: 503, message: 'Service Unavailable' }
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

module.exports = {
  ERROR_CODES,
  HTTP_STATUS
};
