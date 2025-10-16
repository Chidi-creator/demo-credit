import { Response } from "express";
import {
  DatabaseError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  UnauthorizedError,
  RateLimitExceededError,
  ServiceUnavailableError,
} from "./error.manager";
import { SuccessResponse, ErrorResponse } from "./types/response.d";

class ResponseManager {
  /**
   * Handle success response.
   * @param {Object} res - Express response object.
   * @param {Object} data - The data to send back.
   * @param {String} message - Success message (optional).
   * @param {Number} statusCode - HTTP status code for success (default: 200).
   * @param {Object} meta - Additional metadata (optional, e.g., pagination).
   * @returns {void} - Sends the response directly using res object.
   */
  success(
    res: Response,
    data: Array<any> | object,
    message = "Operation successful",
    statusCode = 200,
    meta = null
  ) {
    const response: SuccessResponse = {
      success: true,
      status: statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      response.meta = meta;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Handle error response.
   * @param {Object} res - Express response object.
   * @param {String} message - Error message.
   * @param {Number} statusCode - HTTP status code for the error (default: 500).
   * @param {Object} details - Additional error details (optional).
   * @returns {void} - Sends the response directly using res object.
   */
  error(
    res: Response,
    message = "An error occurred",
    statusCode = 400,
    details = null
  ) {
    const response: ErrorResponse = {
      success: true,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    if (!details) {
      delete response.details;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Handle validation errors.
   * @param {Object} res - Express response object.
   * @param {Array|Object} errors - List of validation errors or a single error.
   * @param {String} message - Custom error message (optional).
   * @param {Number} statusCode - HTTP status code (default: 400).
   * @returns {void} - Sends the response directly using res object.
   */
  validationError(
    res: Response,
    errors: Array<any> | object | string,
    message = "Validation failed",
    statusCode = 400
  ) {
    const response: ErrorResponse = {
      success: true,
      status: statusCode,
      message,
      errors, // Pass the validation errors (array or object)
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Handle paginated success response.
   * @param {Object} res - Express response object.
   * @param {Object} data - The paginated data to send back.
   * @param {Number} totalCount - Total count of items.
   * @param {Number} currentPage - The current page.
   * @param {Number} itemsPerPage - Number of items per page.
   * @param {String} message - Success message (optional).
   * @param {Number} statusCode - HTTP status code (default: 200).
   * @returns {void} - Sends the response directly using res object.
   */
  paginate(
    res: Response,
    data: Array<any> | object,
    totalCount: number,
    currentPage: number,
    itemsPerPage: number,
    message = "Operation successful",
    statusCode = 200
  ) {
    const response: SuccessResponse = {
      success: true,
      status: statusCode,
      message,
      data,
      pagination: {
        totalItems: totalCount,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalCount / itemsPerPage),
      },
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Handle unauthorized access.
   * @param {Object} res - Express response object.
   * @param {String} message - Unauthorized message (default: "Unauthorized access").
   * @param {Number} statusCode - HTTP status code (default: 401).
   * @returns {void} - Sends the response directly using res object.
   */
  unauthorized(
    res: Response,
    message = "Unauthorized access",
    statusCode = 401
  ) {
    const response: ErrorResponse = {
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Handle forbidden access.
   * @param {Object} res - Express response object.
   * @param {String} message - Forbidden message (default: "Forbidden").
   * @param {Number} statusCode - HTTP status code (default: 403).
   * @returns {void} - Sends the response directly using res object.
   */
  forbidden(res: Response, message = "Forbidden", statusCode = 403) {
    const response: ErrorResponse = {
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Handle not found response.
   * @param {Object} res - Express response object.
   * @param {String} message - Not found message (default: "Resource not found").
   * @param {Number} statusCode - HTTP status code (default: 404).
   * @returns {void} - Sends the response directly using res object.
   */
  notFound(res: Response, message = "Resource not found", statusCode = 404) {
    const response: ErrorResponse = {
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Handle conflict response.
   * @param {Object} res - Express response object.
   * @param {String} message - Conflict message (default: "Conflict detected").
   * @param {Number} statusCode - HTTP status code (default: 409).
   * @returns {void} - Sends the response directly using res object.
   */
  conflict(res: Response, message = "Conflict detected", statusCode = 409) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle internal server error.
   * @param {Object} res - Express response object.
   * @param {String} message - Internal server error message (default: "Internal server error").
   * @param {Number} statusCode - HTTP status code (default: 500).
   * @returns {void} - Sends the response directly using res object.
   */
  internalError(
    res: Response,
    message = "Internal server error",
    statusCode = 500
  ) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle rate limit exceeded.
   * @param {Object} res - Express response object.
   * @param {String} message - Rate limit exceeded message (default: "Rate limit exceeded").
   * @param {Number} statusCode - HTTP status code (default: 429).
   * @returns {void} - Sends the response directly using res object.
   */
  rateLimitExceeded(
    res: Response,
    message = "Rate limit exceeded",
    statusCode = 429
  ) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle service unavailable response.
   * @param {Object} res - Express response object.
   * @param {String} message - Service unavailable message (default: "Service unavailable").
   * @param {Number} statusCode - HTTP status code (default: 503).
   * @returns {void} - Sends the response directly using res object.
   */
  serviceUnavailable(
    res: Response,
    message = "Service unavailable",
    statusCode = 503
  ) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  handleError(res: Response, error: Error) {
    if (error instanceof NotFoundError) {
      return this.notFound(res, error.message);
    } else if (error instanceof DatabaseError) {
      return this.internalError(res, error.message);
    } else if (error instanceof ValidationError) {
      return this.validationError(res, error.message);
    } else if (error instanceof UnauthorizedError) {
      return this.unauthorized(res, error.message);
    } else if (error instanceof ForbiddenError) {
      return this.forbidden(res, error.message);
    } else if (error instanceof ConflictError) {
      return this.conflict(res, error.message);
    } else if (error instanceof RateLimitExceededError) {
      return this.rateLimitExceeded(res, error.message);
    } else if (error instanceof ServiceUnavailableError) {
      return this.serviceUnavailable(res, error.message);
    } else {
      return this.internalError(res, error?.message);
    }
  }
}

export default ResponseManager;
