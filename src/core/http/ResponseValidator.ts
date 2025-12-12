import { HttpResponse } from './HttpClient';
import { ValidationError } from '../utils/ErrorHandler';
import logger from '../utils/Logger';

/**
 * Validation rule interface.
 * Defines the structure for custom validation rules.
 * @template T - The type of data being validated
 */
export interface ValidationRule<T = any> {
  /** Optional field name being validated */
  field?: string;
  /** Validation function that returns true if valid */
  validate: (data: T) => boolean;
  /** Error message to display if validation fails */
  message: string;
}

/**
 * Response Validator utility class.
 * Provides static methods for validating HTTP responses and data.
 */
export class ResponseValidator {
  /**
   * Validates that the response status matches expected value(s).
   * @param response - HTTP response to validate
   * @param expectedStatus - Expected status code or array of acceptable status codes
   * @throws {ValidationError} If status doesn't match expected value(s)
   */
  static validateStatus(response: HttpResponse, expectedStatus: number | number[]): void {
    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    if (!expected.includes(response.status)) {
      throw new ValidationError(
        `Expected status ${expected.join(' or ')}, got ${response.status}`,
        'status',
        { expected, actual: response.status }
      );
    }
  }

  /**
   * Validates data against a set of validation rules.
   * @template T - The type of data being validated
   * @param data - The data to validate
   * @param rules - Array of validation rules to apply
   * @throws {ValidationError} If any rule fails validation
   */
  static validateSchema<T = any>(data: T, rules: ValidationRule<T>[]): void {
    for (const rule of rules) {
      try {
        if (!rule.validate(data)) {
          throw new ValidationError(rule.message, rule.field, { data });
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(
          `Validation failed: ${rule.message}`,
          rule.field,
          { error, data }
        );
      }
    }
    logger.debug('Schema validation passed', { rulesCount: rules.length });
  }

  /**
   * Validates that required fields are present in the data.
   * Supports nested field paths using dot notation (e.g., 'user.name').
   * @template T - The type of data being validated
   * @param data - The data to validate
   * @param fields - Array of required field names (supports nested paths)
   * @throws {ValidationError} If any required field is missing or null
   */
  static validateRequired<T = any>(data: T, fields: string[]): void {
    const missing: string[] = [];

    for (const field of fields) {
      const value = this.getNestedValue(data, field);
      if (value === undefined || value === null) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missing.join(', ')}`,
        missing[0],
        { missing, data }
      );
    }
  }

  /**
   * Validates that a field has the expected type.
   * Supports nested field paths using dot notation.
   * @template T - The type of data being validated
   * @param data - The data containing the field
   * @param field - Field name to validate (supports nested paths)
   * @param expectedType - Expected type ('string', 'number', 'boolean', 'array', etc.)
   * @throws {ValidationError} If field type doesn't match expected type
   */
  static validateType<T = any>(data: T, field: string, expectedType: string): void {
    const value = this.getNestedValue(data, field);
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (actualType !== expectedType) {
      throw new ValidationError(
        `Field '${field}' should be of type '${expectedType}', got '${actualType}'`,
        field,
        { expected: expectedType, actual: actualType, value }
      );
    }
  }

  /**
   * Validates that a field is an array and contains at least one element.
   * Supports nested field paths using dot notation.
   * @template T - The type of data being validated
   * @param data - The data containing the field
   * @param field - Field name to validate (supports nested paths)
   * @throws {ValidationError} If field is not an array or is empty
   */
  static validateArrayNotEmpty<T = any>(data: T, field: string): void {
    const value = this.getNestedValue(data, field);

    if (!Array.isArray(value)) {
      throw new ValidationError(
        `Field '${field}' should be an array`,
        field,
        { value }
      );
    }

    if (value.length === 0) {
      throw new ValidationError(
        `Array field '${field}' should not be empty`,
        field,
        { value }
      );
    }
  }

  /**
   * Validates that a numeric value is within a specified range.
   * @param value - The numeric value to validate
   * @param min - Minimum allowed value (inclusive)
   * @param max - Maximum allowed value (inclusive)
   * @param field - Optional field name for error reporting
   * @throws {ValidationError} If value is outside the specified range
   */
  static validateRange(value: number, min: number, max: number, field?: string): void {
    if (value < min || value > max) {
      throw new ValidationError(
        `Value ${value} is out of range [${min}, ${max}]`,
        field,
        { value, min, max }
      );
    }
  }

  /**
   * Validates that a string value matches a regular expression pattern.
   * @param value - The string value to validate
   * @param pattern - Regular expression pattern to match against
   * @param field - Optional field name for error reporting
   * @throws {ValidationError} If value doesn't match the pattern
   */
  static validatePattern(value: string, pattern: RegExp, field?: string): void {
    if (!pattern.test(value)) {
      throw new ValidationError(
        `Value does not match pattern ${pattern}`,
        field,
        { value, pattern: pattern.toString() }
      );
    }
  }

  /**
   * Validates that a value is one of the allowed enumeration values.
   * @template T - The type of the value being validated
   * @param value - The value to validate
   * @param allowedValues - Array of allowed values
   * @param field - Optional field name for error reporting
   * @throws {ValidationError} If value is not in the allowed values
   */
  static validateEnum<T>(value: T, allowedValues: T[], field?: string): void {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        `Value must be one of: ${allowedValues.join(', ')}`,
        field,
        { value, allowedValues }
      );
    }
  }

  /**
   * Retrieves a value from a nested object using dot notation path.
   * @private
   * @param obj - The object to extract the value from
   * @param path - Dot-separated path to the value (e.g., 'user.address.city')
   * @returns The value at the specified path, or undefined if not found
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
