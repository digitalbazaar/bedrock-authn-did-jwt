/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
const async = require('async');
const authnDidJwt = require('bedrock-authn-did-jwt');
const config = require('bedrock').config;
const jwt = require('jsonwebtoken');
let request = require('request');
request = request.defaults({jar: true, json: true, strictSSL: false});
const url = require('url');

const loginEndpoint = {
  protocol: 'https',
  host: config.server.host,
  pathname: config['authn-did-jwt'].routes.login
};
const secureEndpoint = {
  protocol: 'https',
  host: config.server.host,
  pathname: '/secure-endpoint'
};

describe('bedrock-authn-did-jwt HTTP API', () => {
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
