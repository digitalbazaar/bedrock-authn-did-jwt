/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
const async = require('async');
const authnDidJwt = require('bedrock-authn-did-jwt');

describe('bedrock-authn-did-jwt API', () => {
  describe('generateToken API', () => {
    describe('secret set properly', () => {
      it('should generate a token', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        authnDidJwt.generateToken(did, (err, token) => {
          should.not.exist.err;
          authnDidJwt._verify(token, (err, result) => {
            should.not.exist.err;
            should.exist(result.sub);
            result.sub.should.equal(did);
            done();
          });
        });
      });
      it('should generate 20,000 tokens', done => {
        const did = 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794';
        async.timesSeries(20000, (n, next) => {
          authnDidJwt.generateToken(did, next);
        }, done);
      });
      it('should return an error on invalid DID', done => {
        const did = 'invalidDid';
        authnDidJwt.generateToken(did, (err) => {
          should.exist.err;
          err.name.should.equal('InvalidDid');
          done();
        });
      });
    });
  }); // end generateToken
});
