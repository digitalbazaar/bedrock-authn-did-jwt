/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const async = require('async');
const bedrock = require('bedrock');
const config = bedrock.config;
const jwt = require('jsonwebtoken');
let jsonld = bedrock.jsonld;
let	jsigs = require('jsonld-signatures');
const passport = require('passport');
const BedrockError = bedrock.util.BedrockError;
require('bedrock-passport');

let didio;
bedrock.events.on('bedrock.ready', () => {
  // create local copy of jsonld
  jsonld = jsonld();
  // set didio defaults
  didio = require('did-io')(config.passport.strategies.did.didio);
  // this allows custom document loaders to be configured
  didio.use('jsonld', jsonld);
  // use didio when getting JSON-LD docs and wrap the bedrock.jsonld
  // document loader
  jsonld.documentLoader = didio.createDocumentLoader({
    wrap: function(url, callback) {
      return bedrock.jsonld.documentLoader(url, callback);
    }
  });
  // create local jsigs copy and use local jsonld copy
  jsigs = jsigs();
  jsigs.use('jsonld', jsonld);
});

/**
 * Creates a new didJwt Strategy for use with passport.
 */
class Strategy extends passport.Strategy {
  constructor(options) {
    super();
    this.name = 'didJwt',
    this.options = options;
    this.store = null;
  }
}

module.exports = Strategy;

/**
 * Authenticate a request.
 *
 * @param req the request to authenticate.
 */
Strategy.prototype.authenticate = function(req) {
  const self = this;
  if(!(`authorization` in req.headers)) {
    return self.error(new BedrockError(
      '`Authorization` header is required.', 'InvalidHeader'));
  }
  const authHeader = req.headers.authorization.split(' ');
  if(authHeader.length !== 2 || authHeader[0].toLowerCase() !== 'bearer') {
    return self.error(new BedrockError(
      '`Authorization` header format must be `Bearer <token>`.',
      'InvalidHeader', {
        header: req.headers.authorization
      }));
  }
  const token = authHeader[1];

  self.verify(token, (err, payload) => {
    if(err) {
      return self.error(new BedrockError(
        'Invalid Token.', 'InvalidToken', {}, err));
    }
    req.user = {
      identity: {id: payload.sub}
    };
    self.success(req.user);
  });
};

Strategy.prototype.init = function(callback) {
  const self = this;
  if(self.store) {
    async.parallel([
      callback => async.forEachOf(
        config['authn-did-jwt'].crossDomainAuthn.namespaces,
        (v, k, callback) => self.store.provision(v, callback),
        callback),
      callback => async.forEachOf(
        config['authn-did-jwt'].sameDomainAuthn.namespaces,
        (v, k, callback) => self.store.provision(v, callback),
        callback)
    ], callback);
  }
};

Strategy.prototype.setStore = function(store, callback) {
  this.store = store;
  callback();
};

/**
 * Verify a JWT signed with a WebKey-compatible algorithm such as RS256.
 *
 * @param token the token to be verified.
 * @param callback(err, tokenPayload) called once the operation completes.
 */
Strategy.prototype.verify = function(token, callback) {
  let decodedToken;
  let header;
  let payload;
  try {
    decodedToken = jwt.decode(token, {complete: true});
    header = decodedToken.header;
    payload = decodedToken.payload;
  } catch(e) {
    return callback(e);
  }

  // make sure algorithm is supported
  // TODO: add support for ECC, etc.
  const algorithmPrefix = header.alg.substring(0,2);
  if(!(['RS', 'HS'].includes(algorithmPrefix)) || !this.store) {
    return callback(new Error('Unsupported signing algorithm.'));
  }

  // handle HMAC via store
  if(algorithmPrefix === 'HS') {
    return this.store.verify(token, callback);
  }

  // handle asymmetric Web Key signed token
  if(!('sub' in payload)) {
    return callback(new Error('Token `sub` is required.'));
  }
  const subject = payload.sub;
  if(subject.indexOf('did:') !== 0) {
    return callback(new Error(
      'Token `sub` must be a valid decentralized identifier.', 'InvalidToken'));
  }

  if(!header.kid || !(/^(did:|https:)/.test(header.kid))) {
    return callback(new Error('Invalid or missing key identifier in token.'));
  }
  return async.auto({
    // dereference the `kid` URL to find the public key
    getKey: jsigs.getPublicKey.bind(jsigs, header.kid),
    // get subject's DDO to allow IDP to authn them if whitelisted
    getSubjectDdo: didio.get.bind(didio, subject),
    // ensure key is valid and owner is trusted
    checkKey: ['getKey', 'getSubjectDdo', (callback, results) => {
      const options = {
        checkKeyOwner: _isTrustedSigner,
        custom: {
          subject: results.getSubjectDdo
        }
      };
      if(results.getKey.owner === subject) {
        options.publicKeyOwner = results.getSubjectDdo;
      }
      jsigs.checkKey(results.getKey, options, callback);
    }],
    // verify signature
    verify: ['getKey', (callback, results) => {
      const namespace = config['authn-did-jwt'].crossDomainAuthn
        .namespaces[header.alg];
      jwt.verify(
        token, results.getKey.publicKeyPem, {
          algorithms: [namespace.algorithm],
          audience: config.server.baseUri,
          clockTolerance: namespace.clockToleranceInSecs
        }, callback);
    }]
  }, (err, results) => callback(err, results ? results.verify : false));
};

function _isTrustedSigner(owner, key, options, callback) {
  if(options.custom.subject.id === owner.id ||
    (options.custom.subject.idp === owner.id &&
      config['authn-did-jwt'].crossDomainAuthn.trustedRepositories
        .includes(owner.id))) {
    return callback(null, true);
  }
  callback(new Error(
    'Token is not signed by a trusted source.'));
}
