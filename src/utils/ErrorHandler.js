/**
 * Custom error class for API errors with status code
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || `ERR_${statusCode}`;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation utility for request parameters
 */
export class Validator {
  /**
   * Validates query parameters
   * @param {Object} query - Request query object
   * @param {Object} rules - Validation rules
   * @returns {Object} Validation result with errors array
   */
  static validateQuery(query, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = query[field];
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `${field} is required`
        });
        continue;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (rule.type) {
          const isValid = this.validateType(value, rule.type);
          if (!isValid) {
            errors.push({
              field,
              message: `${field} must be of type ${rule.type}`
            });
          }
        }
        
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${rule.minLength} characters long`
          });
        }
        
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push({
            field,
            message: `${field} must be at most ${rule.maxLength} characters long`
          });
        }
        
        if (rule.min && typeof value === 'number' && value < rule.min) {
          errors.push({
            field,
            message: `${field} must be greater than or equal to ${rule.min}`
          });
        }
        
        if (rule.max && typeof value === 'number' && value > rule.max) {
          errors.push({
            field,
            message: `${field} must be less than or equal to ${rule.max}`
          });
        }
        
        if (rule.regex && typeof value === 'string' && !rule.regex.test(value)) {
          errors.push({
            field,
            message: `${field} format is invalid`
          });
        }
        
        if (rule.enum && Array.isArray(rule.enum) && !rule.enum.includes(value)) {
          errors.push({
            field,
            message: `${field} must be one of the allowed values: ${rule.enum.join(', ')}`
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates body parameters
   * @param {Object} body - Request body object
   * @param {Object} rules - Validation rules
   * @returns {Object} Validation result with errors array
   */
  static validateBody(body, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = body[field];
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `${field} is required`
        });
        continue;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (rule.type) {
          const isValid = this.validateType(value, rule.type);
          if (!isValid) {
            errors.push({
              field,
              message: `${field} must be of type ${rule.type}`
            });
          }
        }
        
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${rule.minLength} characters long`
          });
        }
        
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push({
            field,
            message: `${field} must be at most ${rule.maxLength} characters long`
          });
        }
        
        if (rule.min && typeof value === 'number' && value < rule.min) {
          errors.push({
            field,
            message: `${field} must be greater than or equal to ${rule.min}`
          });
        }
        
        if (rule.max && typeof value === 'number' && value > rule.max) {
          errors.push({
            field,
            message: `${field} must be less than or equal to ${rule.max}`
          });
        }
        
        if (rule.regex && typeof value === 'string' && !rule.regex.test(value)) {
          errors.push({
            field,
            message: `${field} format is invalid`
          });
        }
        
        if (rule.enum && Array.isArray(rule.enum) && !rule.enum.includes(value)) {
          errors.push({
            field,
            message: `${field} must be one of the allowed values: ${rule.enum.join(', ')}`
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates parameter type
   * @param {*} value - Value to validate
   * @param {string} type - Expected type
   * @returns {boolean} True if type matches
   */
  static validateType(value, type) {
    switch (type.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }
}

/**
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error details
  console.error('Error occurred:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    code = 'CAST_ERROR';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
    code = 'FILE_SIZE_LIMIT';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected field in form data';
    code = 'UNEXPECTED_FILE';
  }

  // Send error response in standardized format
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Export default object with all utilities
export default {
  APIError,
  Validator,
  errorHandler
};