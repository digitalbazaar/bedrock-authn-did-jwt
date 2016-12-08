/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const async = require('async');
const bedrock = require('bedrock');
const brIdentity = require('bedrock-identity');
const brPassport = require('bedrock-passport');
const config = bedrock.config;
const optionallyAuthenticated = brPassport.optionallyAuthenticated;
const validate = require('bedrock-validation').validate;
const BedrockError = bedrock.util.BedrockError;

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
    strategy = new DidJwtStrategy();
  } catch(err) {
    logger.error('Error when attempting to instantiate DidJwtStrategy.', err);
    return callback(err);
  }
  bedrock.events.emit(
    'bedrock-authn-did-jwt.config.keyStore', strategy, err => {
      if(err) {
        logger.error('Error when attempting to provision JWT key store.', err);
        return callback(err);
      }
      brPassport.use({
        strategy: strategy
      });
      callback();
    });
});

bedrock.events.on('bedrock.ready', callback => strategy.init(callback));

// add routes
bedrock.events.on('bedrock-express.configure.routes', app => {
  const routes = config['authn-did-jwt'].routes;

  app.post(routes.login, api.login);

  // only add route for generating tokens if there is a key store
  if(strategy.store) {
    app.post(routes.token, optionallyAuthenticated, (req, res, next) => {
      if(req.user && 'identity' in req.user) {
        const payload = {
          sub: req.user.identity.id
        };
        if(req.body.aud) {
          if(req.body.aud.indexOf('https:') !== 0) {
            return next(new BedrockError(
              'Token `aud` must be an HTTPS URL.', 'InvalidToken',
              {aud: req.body.aud, public: true, httpStatusCode: 400}));
          }
          payload.aud = req.body.aud;
        }
        return api.generateToken(payload, (err, token) => {
          if(err) {
            return next(err);
          }
          res.json({token: token});
        });
      }
      const v = validate('authn-did-jwt.postToken', req.body);
      if(!v.valid) {
        return next(v.error);
      }
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
          api.generateToken({sub: did}, callback);
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
        res.sendStatus(204);
      });
    }); // end routes.token
  }
});  // end routes

/**
 * Generate a JWT.
 *
 * @param payload the payload to encode into the JWT.
 * @param callback callback(err, token) called when done.
 */
api.generateToken = function(payload, callback) {
  if(!strategy.store) {
    return callback(new BedrockError(
      'No key store has been set.', 'NotFound'));
  }
  // TODO: `sub` could also be an HTTP URL in the future
  if(!payload.sub || !(/^did:/.test(payload.sub))) {
    return callback(new BedrockError(
      '`options.payload.sub` must be a decentralized identifier.',
      'InvalidPayload'));
  }
  if(payload.aud && !(/^(did:|https:)/.test(payload.aud))) {
    return callback(new BedrockError(
      '`options.payload.aud` must be a URL.',
      'InvalidPayload'));
  }

  let namespace;
  if(payload.aud) {
    namespace = 'crossDomainAuthn-RS256';
  } else {
    namespace = 'sameDomainAuthn-HS256';
  }
  strategy.store.sign({namespace: namespace, payload: payload}, callback);
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

// NOTE: for testing only
api._verify = function(token, callback) {
  strategy.verify(token, callback);
};
