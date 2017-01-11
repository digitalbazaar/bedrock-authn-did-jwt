/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
const schemas = require('bedrock-validation').schemas;

const schema = {};
module.exports = schema;

schema.postToken = function() {
  return {
    type: 'object',
    properties: {
      email: schemas.email()
    },
    additionalProperties: false
  };
};

schema.constructor = function() {
  return {
    type: 'object',
    properties: {
      algorithm: {
        required: true,
        enum: ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256',
          'HS384', 'HS512', 'none']
      },
      clockToleranceInSecs: {type: 'integer', required: true},
      namespace: schemas.identifier(),
      ttlInSecs: {type: 'integer', required: true}
    },
    additionalProperties: false
  };
};
