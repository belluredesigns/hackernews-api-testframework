import Ajv from 'ajv';

/**
 * JSON Schema for validating HackerNews items.
 * Defines the structure and validation rules for any item type.
 */
export const itemSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    type: {
      type: 'string',
      enum: ['job', 'story', 'comment', 'poll', 'pollopt'],
    },
    by: { type: 'string' },
    time: { type: 'number' },
    text: { type: 'string' },
    dead: { type: 'boolean' },
    parent: { type: 'number' },
    poll: { type: 'number' },
    kids: {
      type: 'array',
      items: { type: 'number' },
    },
    url: { type: 'string' },
    score: { type: 'number' },
    title: { type: 'string' },
    parts: {
      type: 'array',
      items: { type: 'number' },
    },
    descendants: { type: 'number' },
    deleted: { type: 'boolean' },
  },
  required: ['id'],
  additionalProperties: false,
};

/**
 * JSON Schema for validating HackerNews stories.
 * Extends the item schema with story-specific required fields.
 */
export const storySchema = {
  type: 'object',
  properties: {
    ...itemSchema.properties,
    type: { type: 'string', const: 'story' },
    title: { type: 'string' },
    by: { type: 'string' },
    time: { type: 'number' },
  },
  required: ['id', 'type', 'title', 'by', 'time'],
  additionalProperties: false,
};

/**
 * JSON Schema for validating HackerNews comments.
 * Extends the item schema with comment-specific required fields.
 */
export const commentSchema = {
  type: 'object',
  properties: {
    ...itemSchema.properties,
    type: { type: 'string', const: 'comment' },
    by: { type: 'string' },
    parent: { type: 'number' },
    text: { type: 'string' },
    time: { type: 'number' },
  },
  required: ['id', 'type', 'by', 'parent', 'text', 'time'],
  additionalProperties: false,
};

/**
 * JSON Schema for validating HackerNews job postings.
 * Extends the item schema with job-specific required fields.
 */
export const jobSchema = {
  type: 'object',
  properties: {
    ...itemSchema.properties,
    type: { type: 'string', const: 'job' },
    title: { type: 'string' },
    by: { type: 'string' },
    time: { type: 'number' },
  },
  required: ['id', 'type', 'title', 'by', 'time'],
  additionalProperties: false,
};

const ajv = new Ajv();

/**
 * AJV validator function for item schema.
 * Use this to validate if data conforms to the HackerNews item structure.
 */
export const validateItem = ajv.compile(itemSchema);

/**
 * AJV validator function for story schema.
 * Use this to validate if data conforms to the HackerNews story structure.
 */
export const validateStory = ajv.compile(storySchema);

/**
 * AJV validator function for comment schema.
 * Use this to validate if data conforms to the HackerNews comment structure.
 */
export const validateComment = ajv.compile(commentSchema);

/**
 * AJV validator function for job schema.
 * Use this to validate if data conforms to the HackerNews job structure.
 */
export const validateJob = ajv.compile(jobSchema);
