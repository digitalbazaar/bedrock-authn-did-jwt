/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const async = require('async');
const bedrock = require('bedrock');
const brIdentity = require('bedrock-identity');
const brPassport = require('bedrock-passport');
const config = bedrock.config;
const ensureAuthenticated = brPassport.ensureAuthenticated;
const validate = require('bedrock-validation').validate;
const BedrockError = bedrock.util.BedrockError;

const STORE_NAMESPACE = 'authn-did-jwt';
let strategy = null;

// module API
const api = {};
module.exports = api;

const logger = bedrock.loggers.get('app');

require('./config');

// configure passport before serving static files
bedrock.events.on('bedrock-express.configure.static', (e, callback) => {
  const DidJwtStrategy = require('./DidJwtStrategy');
  try {
    strategy = new DidJwtStrategy({
      algorithm: config['authn-did-jwt'].token.algorithm,
      clockToleranceInSecs: config['authn-did-jwt'].token.clockToleranceInSecs,
      namespace: STORE_NAMESPACE,
      ttlInSecs: config['authn-did-jwt'].token.ttlInSecs
    });
  } catch(err) {
    logger.error('Error when attempting to instantiate DidJwtStrategy.', err);
    return callback(err);
  }
  bedrock.events.emit(
    'bedrock-authn-did-jwt.config.secretStore', strategy, err => {
      if(err) {
        return callback(err);
      }
      brPassport.use({
        strategy: strategy
      });
      callback();
    });
});

// add routes
bedrock.events.on('bedrock-express.configure.routes', app => {
  const routes = config['authn-did-jwt'].routes;

  app.post(routes.login, api.login);

  app.get(routes.token, ensureAuthenticated, (req, res, next) => {
    const did = req.user.identity.id;
    api.generateToken(did, (err, token) => {
      if(err) {
        return next(err);
      }
      res.json({token: token});
    });
  });

  app.post(routes.token,
    validate('authn-did-jwt.postToken'), (req, res, next) => {
      const email = req.body.email.toLowerCase();
      async.auto({
        getIdentity: callback => {
          brIdentity.getAll(
            null, {'identity.email': email}, {
              'identity.id': true,
              'identity.email': true
            }, (err, result) => {
              if(err) {
                return callback(err);
              }
              if(result.length === 0) {
                return callback(new BedrockError(
                  'Identity not found.', 'NotFound',
                  {email: email, public: true, httpStatusCode: 404}));
              }
              callback(null, result[0].identity);
            });
        },
        generateToken: ['getIdentity', (callback, results) =>{
          const did = results.getIdentity.id;
          api.generateToken(did, callback);
        }],
        emit: ['generateToken', (callback, results) => {
          const event = {
            type: 'bedrock.authn-did-jwt.token',
            identity: results.getIdentity,
            token: results.generateToken
          };
          bedrock.events.emitLater(event);
          callback();
        }]
      }, err => {
        if(err) {
          return next(err);
        }
        res.sendStatus(200);
      });
    });
});  // end routes

/**
 * Generate a JWT.
 *
 * @param did the did to encode into the JWT.
 * @param callback callback(err, token) called when done.
 */
api.generateToken = function(did, callback) {
  if(did.indexOf('did:') !== 0) {
    return callback(new BedrockError(
      'Invalid decentralized identifier specified.', 'InvalidDid',
      {'public': true, httpStatusCode: 400}));
  }
  strategy.store.sign({
    namespace: STORE_NAMESPACE,
    payload: {
      'bedrock-authn-did': did
    }
  }, callback);
};

// NOTE: for testing only
api._verify = function(token, callback) {
  strategy.store.verify({namespace: STORE_NAMESPACE, token: token}, callback);
};

/**
 * Attempt to establish an authorized session for the user that sent the
 * request. Upon success, a status code of 200 and the identity that was
 * authenticated are sent to the client.
 *
 * @param req the request.
 * @param res the response.
 * @param next the next route handler.
 */
api.login = function(req, res, next) {
  brPassport.authenticate('didJwt', (err, user) => {
    if(!user) {
      // user not authenticated
      err = new BedrockError(
        'The given decentralized identity could not be authenticated.',
        'NotAuthenticated', {'public': true, httpStatusCode: 400}, err);
    }
    if(err) {
      return next(err);
    }
    req.login(user, err => {
      if(err) {
        return next(err);
      }
      res.status(200).send(user.identity);
    });
  })(req, res, next);
};
