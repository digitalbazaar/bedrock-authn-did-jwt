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
