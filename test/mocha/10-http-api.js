/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
const async = require('async');
const authnDidJwt = require('bedrock-authn-did-jwt');
const bedrock = require('bedrock');
const config = require('bedrock').config;
const helpers = require('./helpers');
const jwt = require('jsonwebtoken');
const mockData = require('./mock.data');
let request = require('request');
request = request.defaults({jar: true, json: true, strictSSL: false});
const url = require('url');

const loginEndpoint = {
  protocol: 'https',
  host: config.server.host,
  pathname: config['authn-did-jwt'].routes.login
};
const tokenEndpoint = {
  protocol: 'https',
  host: config.server.host,
  pathname: config['authn-did-jwt'].routes.token
};
const secureEndpoint = {
  protocol: 'https',
  host: config.server.host,
  pathname: '/secure-endpoint'
};

describe('bedrock-authn-did-jwt HTTP API', () => {
  before(done => {
    helpers.prepareDatabase(mockData, done);
  });
  describe('token API', () => {
    describe('authenticated requests', () => {
      const actor = mockData.identities.regularUser;
      it('responds with a token containing the user\'s DID', done => {
        request.post(helpers.createHttpSignatureRequest({
          url: url.format(tokenEndpoint),
          body: {},
          identity: actor
        }), function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(200);
          body.should.be.an('object');
          should.exist(body.token);
          authnDidJwt._verify(body.token, (err, result) => {
            result['jwt.sub'].should.equal(actor.identity.id);
            done();
          });
        });
      });
    }); // end authenticated requests
    describe('unauthenticated requests', () => {
      it('responds 404 for unknown identity', done => {
        const email = 'unknown@bedrock.dev';
        request.post({
          uri: url.format(tokenEndpoint),
          json: {email: email}
        }, (err, res) => {
          should.not.exist(err);
          res.statusCode.should.equal(404);
          res.body.type.should.equal('NotFound');
          done();
        });
      });
      it('responds 204 for known identity and emits an event', done => {
        let event;
        bedrock.events.on('bedrock.authn-did-jwt.token', e => {
          event = e;
        });
        const identity = mockData.identities.regularUser.identity;
        request.post({
          uri: url.format(tokenEndpoint),
          json: {email: identity.email}
        }, (err, res) => {
          should.not.exist(err);
          res.statusCode.should.equal(204);
          event.identity.id.should.equal(identity.id);
          event.identity.email.should.equal(identity.email);
          should.exist(event.token);
          done();
        });
      });
    }); // end unauthenticated requests
  });
  describe('login API', () => {
    describe('Group 1', () => {
      it('allows login', done => {
        const did = 'did:07bc543e-1e54-4051-9a9b-7fa0606aa9e5';
        async.auto({
          getToken: callback => {
            authnDidJwt.generateToken(did, callback);
          },
          login: ['getToken', (callback, results) => {
            request.post({
              uri: url.format(loginEndpoint),
              json: {token: results.getToken}
            }, (err, res, body) => {
              should.not.exist(err);
              should.exist(body.id);
              body.id.should.equal(did);
              callback();
            });
          }],
          test: ['login', callback => {
            request.get(url.format(secureEndpoint), (err, res, body) => {
              should.not.exist(err);
              should.exist(body.id);
              body.id.should.equal(did);
              callback();
            });
          }]
        }, done);
      });
      it('login fails if client uses incorrect secret', done => {
        const did = 'did:af3a76a8-cfba-4146-b035-ecf957e3ccf5';
        const nowInSecs = Math.floor(Date.now() / 1000);
        const notAfter = nowInSecs + 10;
        const token = jwt.sign({
          exp: notAfter,
          iat: nowInSecs,
          'urn:bedrock.authn': {
            did: did
          }
        }, 'itsthewrongsecret');
        request.post({
          uri: url.format(loginEndpoint),
          json: {token: token}
        }, (err, res, body) => {
          should.not.exist(err);
          should.exist(body.type);
          body.type.should.equal('NotAuthenticated');
          done();
        });
      });
    }); // end Group 1
  }); // end login API
}); // end api
