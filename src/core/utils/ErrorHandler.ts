import logger from './Logger';

/**
 * Custom error class for API-related errors.
 * Extends the built-in Error class with API-specific context.
 */
export class APIError extends Error {
  /** HTTP status code of the failed request */
  public statusCode: number;
  /** The API endpoint that was called */
  public endpoint: string;
  /** The response body from the API, if available */
  public responseBody?: any;

  /**
   * Creates a new APIError instance.
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param endpoint - API endpoint that failed
   * @param responseBody - Optional response body from the API
   */
  constructor(
    statusCode: number,
    message: string,
    endpoint: string,
    responseBody?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.responseBody = responseBody;
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Custom error class for validation errors.
 * Used when data validation fails in the test framework.
 */
export class ValidationError extends Error {
  /** The field that failed validation, if applicable */
  public field?: string;
  /** Additional details about the validation failure */
  public validationDetails?: any;

  /**
   * Creates a new ValidationError instance.
   * @param message - Error message describing the validation failure
   * @param field - Optional field name that failed validation
   * @param validationDetails - Optional additional validation details
   */
  constructor(
    message: string,
    field?: string,
    validationDetails?: any
  ) {
    super(message);
    this.field = field;
    this.validationDetails = validationDetails;
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Custom error class for configuration errors.
 * Used when there are issues with test framework configuration.
 */
export class ConfigurationError extends Error {
  /**
   * Creates a new ConfigurationError instance.
   * @param message - Error message describing the configuration issue
   */
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error Handler utility class.
 * Provides static methods to handle and throw different types of errors with proper logging.
 */
export class ErrorHandler {
  /**
   * Handles API errors by logging and throwing appropriate APIError.
   * @param error - The error object to handle
   * @param endpoint - The API endpoint where the error occurred
   * @throws {APIError} Always throws an APIError with context
   */
  static handleAPIError(error: any, endpoint: string): never {
    logger.error(`API Error at ${endpoint}:`, error);

    if (error instanceof APIError) {
      throw error;
    }

    if (error.response) {
      throw new APIError(
        error.response.status,
        error.message || 'API request failed',
        endpoint,
        error.response.data
      );
    }

    throw new APIError(500, error.message || 'Unknown API error', endpoint);
  }

  /**
   * Handles validation errors by logging and throwing a ValidationError.
   * @param message - Error message describing the validation failure
   * @param field - Optional field name that failed validation
   * @param details - Optional additional validation details
   * @throws {ValidationError} Always throws a ValidationError
   */
  static handleValidationError(message: string, field?: string, details?: any): never {
    logger.error(`Validation Error: ${message}`, { field, details });
    throw new ValidationError(message, field, details);
  }

  /**
   * Handles configuration errors by logging and throwing a ConfigurationError.
   * @param message - Error message describing the configuration issue
   * @throws {ConfigurationError} Always throws a ConfigurationError
   */
  static handleConfigurationError(message: string): never {
    logger.error(`Configuration Error: ${message}`);
    throw new ConfigurationError(message);
  }
}
