/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
const config = require('bedrock').config;
const path = require('path');

config['authn-did-jwt'] = {};
config['authn-did-jwt'].routes = {
  login: '/authn/did-jwt/login',
  token: '/authn/did-jwt/token'
};

config['authn-did-jwt'].token = {
  algorithm: 'HS256',
  clockToleranceInSecs: 5,
  ttlInSecs: 3600
};

// common validation schemas
config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);
