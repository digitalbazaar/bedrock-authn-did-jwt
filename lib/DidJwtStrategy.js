/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
const passport = require('passport');
const util = require('util');
const validate = require('bedrock-validation').validate;
const BedrockError = bedrock.util.BedrockError;

module.exports = Strategy;

/**
 * Creates a new didJwt Strategy for use with passport.
 */
function Strategy(options) {
  const v = validate('authn-did-jwt.constructor', options);
  if(!v.valid) {
    throw v.error;
  }
  passport.Strategy.call(this);
  this.name = 'didJwt',
  this.options = options;
  this.store = {};
}
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate a request.
 *
 * @param req the request to authenticate.
 */
Strategy.prototype.authenticate = function(req) {
  const self = this;
  self.store.verify({
    namespace: self.options.namespace,
    token: req.body.token
  }, (err, decoded) => {
    if(err) {
      return self.error(err);
    }
    if(!('jwt.sub' in decoded)) {
      return self.error(new BedrockError(
        'Token is invalid.', 'InvalidToken'), {
          token: decoded
        });
    }
    const did = decoded['jwt.sub'];
    if(did.indexOf('did:') !== 0) {
      return self.error(new BedrockError(
        'Invalid decentralized identifier.', 'InvalidToken'));
    }
    req.user = {
      identity: {id: did}
    };
    self.success(req.user);
  });
};

Strategy.prototype.setStore = function(store, callback) {
  this.store = store;
  this.store.provision(this.options, callback);
};
