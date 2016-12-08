/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
const async = require('async');
const authnDidJwt = require('bedrock-authn-did-jwt');
const bedrock = require('bedrock');
const brTest = require('bedrock-test');
const config = bedrock.config;
const expect = global.chai.expect;
const helpers = require('./helpers');
const jwt = require('jsonwebtoken');
const mockData = require('./mock.data');
const request = brTest.require('request');
const sinon = require('sinon');

describe('bedrock-authn-did-jwt API', () => {
  before(done => {
    sinon.stub(request, 'get')
      .yields(null, {statusCode: 200}, mockData.sinon.publicKey);
    helpers.prepareDatabase(mockData, done);
  });
  describe('generateToken API', () => {
    describe('Group 1', () => {
      it('should generate a token using HS256', done => {
        const alg = 'HS256';
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        authnDidJwt.generateToken({sub: did}, (err, token) => {
          expect(err).to.not.be.ok;
          const decodedToken = jwt.decode(token, {complete: true});
          decodedToken.header.alg.should.equal(alg);
          authnDidJwt._verify(token, (err, result) => {
            expect(err).to.not.be.ok;
            should.not.exist.err;
            should.exist(result.sub);
            result.sub.should.equal(did);
            done();
          });
        });
      });
      it('generates a token including `aud` a HTTPS URL', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        const aud = config.server.baseUri;
        authnDidJwt.generateToken({sub: did, aud: aud}, (err, token) => {
          expect(err).to.not.be.ok;
          authnDidJwt._verify(token, (err, result) => {
            expect(err).to.not.be.ok;
            should.not.exist.err;
            should.exist(result.sub);
            result.sub.should.equal(did);
            result.aud.should.equal(aud);
            done();
          });
        });
      });
      it('should generate 10,000 HS256 tokens', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        async.timesSeries(10000, (n, next) => {
          authnDidJwt.generateToken({sub: did}, next);
        }, done);
      });
      it('should generate 1,000 RS256 tokens', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        const aud = config.server.baseUri;
        async.timesSeries(1000, (n, next) => {
          authnDidJwt.generateToken({sub: did, aud: aud}, next);
        }, done);
      });
      it('should return an error on invalid DID', done => {
        const did = 'invalidDid';
        authnDidJwt.generateToken({sub: did}, (err) => {
          should.exist.err;
          err.name.should.equal('InvalidPayload');
          done();
        });
      });
      it('returns an error on invalid `aud`', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        const aud = 'notAUrl';
        authnDidJwt.generateToken({sub: did, aud: aud}, (err) => {
          err.name.should.equal('InvalidPayload');
          done();
        });
      });
    });
  }); // end generateToken
});
