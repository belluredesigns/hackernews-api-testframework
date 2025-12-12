import { ValidationError } from './ErrorHandler';
import logger from './Logger';

/**
 * Schema Validator utility class.
 * Provides static methods for validating data against schema validators.
 */
export class SchemaValidator {
  /**
   * Validates data against a schema validator.
   * Throws a ValidationError if validation fails.
   * @template T - The expected type after validation
   * @param data - The data to validate
   * @param validator - Type guard function that validates the data
   * @param schemaName - Name of the schema for error reporting
   * @returns The validated data as type T
   * @throws {ValidationError} If validation fails
   */
  static validate<T>(
    data: unknown,
    validator: (data: unknown) => data is T,
    schemaName: string
  ): T {
    if (!validator(data)) {
      const errors = (validator as any).errors;
      logger.error(`Schema validation failed for ${schemaName}`, { errors, data });
      throw new ValidationError(
        `Schema validation failed for ${schemaName}`,
        undefined,
        { errors, data }
      );
    }
    return data;
  }

  /**
   * Validates data against a schema validator, returning null on failure.
   * Unlike validate(), this method doesn't throw errors but logs warnings instead.
   * @template T - The expected type after validation
   * @param data - The data to validate (null is allowed and returns null)
   * @param validator - Type guard function that validates the data
   * @param schemaName - Name of the schema for error reporting
   * @returns The validated data as type T, or null if validation fails or data is null
   */
  static validateOrNull<T>(
    data: unknown,
    validator: (data: unknown) => data is T,
    schemaName: string
  ): T | null {
    if (data === null) {
      return null;
    }
    try {
      return this.validate(data, validator, schemaName);
    } catch (error) {
      logger.warn(`Schema validation failed, returning null`, { error });
      return null;
    }
  }
}
