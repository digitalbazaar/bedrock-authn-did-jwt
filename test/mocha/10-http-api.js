/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
const async = require('async');
const authnDidJwt = require('bedrock-authn-did-jwt');
const bedrock = require('bedrock');
const config = require('bedrock').config;
const expect = global.chai.expect;
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
          identity: actor
        }), function(err, res, body) {
          expect(err).to.not.be.ok;
          res.statusCode.should.equal(200);
          body.should.be.an('object');
          should.exist(body.token);
          authnDidJwt._verify(body.token, (err, result) => {
            expect(err).to.not.be.ok;
            result.sub.should.equal(actor.identity.id);
            done();
          });
        });
      });
      it('responds with a token containing the user\'s DID and `aud`', done => {
        const aud = config.server.baseUri;
        request.post(helpers.createHttpSignatureRequest({
          url: url.format(tokenEndpoint),
          json: {
            aud: aud
          },
          identity: actor
        }), function(err, res, body) {
          expect(err).to.not.be.ok;
          res.statusCode.should.equal(200);
          body.should.be.an('object');
          should.exist(body.token);
          const decodedToken = jwt.decode(body.token, {complete: true});
          decodedToken.header.alg.should.equal(
            config['authn-did-jwt'].crossDomainAuthn.namespaces.RS256
              .algorithm);
          authnDidJwt._verify(body.token, (err, result) => {
            expect(err).to.not.be.ok;
            result.sub.should.equal(actor.identity.id);
            result.aud.should.equal(aud);
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
          expect(err).to.not.be.ok;
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
          expect(err).to.not.be.ok;
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
    describe('same origin', () => {
      it('allows login', done => {
        const did = 'did:07bc543e-1e54-4051-9a9b-7fa0606aa9e5';
        async.auto({
          getToken: callback => {
            authnDidJwt.generateToken({sub: did}, callback);
          },
          login: ['getToken', (callback, results) => {
            request.post({
              uri: url.format(loginEndpoint),
              headers: {
                'Authorization': 'Bearer ' + results.getToken
              }
            }, (err, res, body) => {
              expect(err).to.not.be.ok;
              should.exist(body.id);
              body.id.should.equal(did);
              callback();
            });
          }],
          test: ['login', callback => {
            request.get(url.format(secureEndpoint), (err, res, body) => {
              expect(err).to.not.be.ok;
              should.exist(body.id);
              body.id.should.equal(did);
              callback();
            });
          }]
        }, done);
      });
    }); // end same origin
    describe('cross origin', () => {
      it('allows login', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        async.auto({
          getToken: callback => {
            authnDidJwt.generateToken({
              aud: config.server.baseUri,
              sub: did
            }, callback);
          },
          login: ['getToken', (callback, results) => {
            request.post({
              uri: url.format(loginEndpoint),
              headers: {
                'Authorization': 'Bearer ' + results.getToken
              }
            }, (err, res, body) => {
              expect(err).to.not.be.ok;
              should.exist(body.id);
              body.id.should.equal(did);
              callback();
            });
          }],
          test: ['login', callback => {
            request.get(url.format(secureEndpoint), (err, res, body) => {
              expect(err).to.not.be.ok;
              should.exist(body.id);
              body.id.should.equal(did);
              callback();
            });
          }]
        }, done);
      });
      it('returns error if the token `aud` is not this server', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        async.auto({
          getToken: callback => {
            authnDidJwt.generateToken({
              aud: 'https://example.com',
              sub: did
            }, callback);
          },
          login: ['getToken', (callback, results) => {
            request.post({
              uri: url.format(loginEndpoint),
              headers: {
                'Authorization': 'Bearer ' + results.getToken
              }
            }, (err, res, body) => {
              expect(err).to.not.be.ok;
              should.exist(body.type);
              body.type.should.equal('NotAuthenticated');
              callback();
            });
          }]
        }, done);
      });
    }); // end cross origin
  }); // end login API
}); // end api
