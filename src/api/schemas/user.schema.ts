import Ajv from 'ajv';

/**
 * JSON Schema for validating HackerNews users.
 * Defines the structure and validation rules for user profiles.
 */
export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    created: { type: 'number' },
    karma: { type: 'number' },
    about: { type: 'string' },
    submitted: {
      type: 'array',
      items: { type: 'number' },
    },
  },
  required: ['id', 'created', 'karma'],
  additionalProperties: false,
};

const ajv = new Ajv();

/**
 * AJV validator function for user schema.
 * Use this to validate if data conforms to the HackerNews user structure.
 */
export const validateUser = ajv.compile(userSchema);
