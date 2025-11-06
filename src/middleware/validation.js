import { Validator, APIError } from '../utils/ErrorHandler.js';

/**
 * Validation middleware factory
 * @param {Object} rules - Validation rules for query parameters
 * @param {Object} bodyRules - Validation rules for body parameters
 * @returns {Function} Express middleware function
 */
export const validate = (rules = {}, bodyRules = {}) => {
  return (req, res, next) => {
    try {
      // Validate query parameters if rules are provided
      if (Object.keys(rules).length > 0) {
        const queryValidation = Validator.validateQuery(req.query, rules);
        
        if (!queryValidation.isValid) {
          throw new APIError(
            `Query validation failed: ${queryValidation.errors.map(e => e.message).join(', ')}`,
            400,
            'VALIDATION_ERROR'
          );
        }
      }
      
      // Validate body parameters if rules are provided
      if (Object.keys(bodyRules).length > 0) {
        const bodyValidation = Validator.validateBody(req.body, bodyRules);
        
        if (!bodyValidation.isValid) {
          throw new APIError(
            `Body validation failed: ${bodyValidation.errors.map(e => e.message).join(', ')}`,
            400,
            'VALIDATION_ERROR'
          );
        }
      }
      
      // If validation passes, continue to the next middleware
      next();
    } catch (error) {
      // Pass the error to the centralized error handler
      next(error);
    }
  };
};

/**
 * Create a validation middleware for query parameters only
 * @param {Object} rules - Validation rules for query parameters
 * @returns {Function} Express middleware function
 */
export const validateQuery = (rules = {}) => {
  return validate(rules, {});
};

/**
 * Create a validation middleware for body parameters only
 * @param {Object} bodyRules - Validation rules for body parameters
 * @returns {Function} Express middleware function
 */
export const validateBody = (bodyRules = {}) => {
  return validate({}, bodyRules);
};

export default {
  validate,
  validateQuery,
  validateBody
};