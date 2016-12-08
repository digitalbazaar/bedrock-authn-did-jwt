/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const config = require('bedrock').config;
const path = require('path');

config['authn-did-jwt'] = {};
config['authn-did-jwt'].routes = {
  login: '/authn/did-jwt/login',
  token: '/authn/did-jwt/token'
};

config['authn-did-jwt'].sameDomainAuthn = {
  namespaces: {
    HS256: {
      id: 'sameDomainAuthn-HS256',
      algorithm: 'HS256',
      tokenTtlInSecs: 3600,
      clockToleranceInSecs: 5
    }
  }
};

config['authn-did-jwt'].crossDomainAuthn = {
  // for *any* algorithm/namespace we trust these credential repositories
  // for the DIDs
  trustedRepositories: [], // did:e3d6e58d-8109-48a0-87c3-57eab9543509
  namespaces: {
    RS256: {
      id: 'crossDomainAuthn-RS256',
      algorithm: 'RS256',
      key: {
        id: '' // did:b15eaf1b-84de-4f7e-9c77-483051f873f0/keys/1
      },
      tokenTtlInSecs: 3600,
      clockToleranceInSecs: 5
    }
  }
};

// common validation schemas
config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);
