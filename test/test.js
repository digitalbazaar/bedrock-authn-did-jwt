/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
const ensureAuthenticated = require('bedrock-passport').ensureAuthenticated;
require('bedrock-authn-did-jwt');
require('bedrock-jwt-mongodb');

bedrock.events.on('bedrock-express.configure.routes', app => {
  app.get('/secure-endpoint', ensureAuthenticated, (req, res, next) => {
    res.json(req.user.identity);
  });
});

require('bedrock-test');
bedrock.start();
