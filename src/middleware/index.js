import express from "express";
import logApiRequest from "../utils/logApiRequest.js";
import rateLimiter from "./rateLimiter.js";
import { setupSecurity } from "./security.js";

/**
 * Configures and applies all middleware for the Express application
 * @function setupMiddleware
 * @param {express.Application} app - The Express application instance to configure
 * @returns {void}
 * 
 * @example
 * // Usage in main server file:
 * import setupMiddleware from './middleware.js';
 * const app = express();
 * setupMiddleware(app);
 * 
 * @description
 * This function sets up essential middleware for handling JSON parsing, 
 * URL-encoded data, API request logging, and static file serving.
 * The middleware is applied in the following order:
 * 1. Security middleware (CORS, Helmet, rate limiting, sanitization)
 * 2. express.json() - Parses incoming JSON requests
 * 3. express.urlencoded() - Parses URL-encoded data
 * 4. logApiRequest - Custom API request logging middleware
 * 5. rateLimiter - Rate limiting middleware
 * 6. express.static - Serves static files from 'public' directory
 */
export default function setupMiddleware(app) {
  /**
   * Security middleware setup
   * @middleware security
   * @description Applies security headers, rate limiting, sanitization, and CORS
   */
  setupSecurity(app);
  
  /**
   * Custom API request logging middleware
   * @middleware logApiRequest
   * @description Logs details of incoming API requests including method, path, IP, etc.
   */
  app.use(logApiRequest);
  
  /**
   * RateLimiter middleware
   * @middleware rateLimiter
   * @description Applies rate limiting to API requests (additional rate limiting beyond security layer)
   */
  app.use(rateLimiter.middleware);
  
  /**
   * Static file serving middleware
   * @middleware express.static
   * @param {string} 'public' - Directory from which to serve static files
   * @description Serves static files (HTML, CSS, JS, images) from the 'public' directory
   * @see {@link https://expressjs.com/en/starter/static-files.html}
   */
  app.use(express.static('public'));
}