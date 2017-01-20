/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
const config = require('bedrock').config;
const path = require('path');

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// MongoDB
config.mongodb.name = 'bedrock_authn_did_jwt_test';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
config.mongodb.local.collection = 'bedrock_authn_did_jwt_test';
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

const permissions = config.permission.permissions;
const roles = config.permission.roles;

roles['bedrock-auth-did-jwt.test'] = {
  id: 'bedrock-auth-did-jwt.test',
  label: 'Test Role',
  comment: 'Role for Test User',
  sysPermission: [
    permissions.IDENTITY_ACCESS.id
  ]
};

config['authn-did-jwt'].crossDomainAuthn.namespaces.RS256.key =
  'did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58/keys/1';
config['authn-did-jwt'].crossDomainAuthn.trustedRepositories
  .push('did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58');

// Insert Key for dev purposes
// this is similar to the IdP owner key
config.key.keys.push(createKeyPair({
  userId: 'did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58',
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4UdtEFXEWonMj04Rca37\n' +
    'IvGFJIgPakvjK9VNrLog1YkBMQo+kqo1WWJndFoB1mEROtID+LLYCfshHwvR/n5R\n' +
    'StNqPV2/DMMnZb0s3kJ88wyjnDOdCA6eYO7ugjZKBvFfjxbDDFARaBJN7pBECDMw\n' +
    'cvXLsZAs+/bTOOR+/ebXHfuY9uqx0XyyEmLq+mTEJm6MaZKCNmoj0l6IatmGeePm\n' +
    'ZXqd+dAXJew7RNI8wyEiD8VI186a3asOMnV/IvU8PAZImaLPqt/jN9HI7SflrPEI\n' +
    'LWQCUN0Td0qRV09JRMo60CR/c1b3Mwae9A7WQpWRbaEMCbsGtoCLz03dEVIkSgh+\n' +
    'TQIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpAIBAAKCAQEA4UdtEFXEWonMj04Rca37IvGFJIgPakvjK9VNrLog1YkBMQo+\n' +
    'kqo1WWJndFoB1mEROtID+LLYCfshHwvR/n5RStNqPV2/DMMnZb0s3kJ88wyjnDOd\n' +
    'CA6eYO7ugjZKBvFfjxbDDFARaBJN7pBECDMwcvXLsZAs+/bTOOR+/ebXHfuY9uqx\n' +
    '0XyyEmLq+mTEJm6MaZKCNmoj0l6IatmGeePmZXqd+dAXJew7RNI8wyEiD8VI186a\n' +
    '3asOMnV/IvU8PAZImaLPqt/jN9HI7SflrPEILWQCUN0Td0qRV09JRMo60CR/c1b3\n' +
    'Mwae9A7WQpWRbaEMCbsGtoCLz03dEVIkSgh+TQIDAQABAoIBAQCrn8avEygr8Z8t\n' +
    '7cPMX0dcL7PHSQC1cmr3EeHDHWm2RFHsEmnpQlKybg1yzr9nmzuNHEJ6TYXY1ME+\n' +
    '7bplr8YuwzHE3o6WInb5Q03TZcPbRl2+unN/l+OA5YY/HSz4bRrn3+dokfcw2gEV\n' +
    'JkMuHBFlA2zTMYuTyU7RoQI+XIa2B3FvfUX7Av23ci+oHirGCE4qBxD+zx+IRzRV\n' +
    '+4vg5ZiYJN7VcAaeGdlRZ5STuKpG8bfzrChjOzIZzTpHYgZvIMIRsVTwkmYl0248\n' +
    '8vVfMuFbv9ZEbQmDexCOFi/kLeW3cqwjVRvbdBHUk82UnB14WAm7O36TZSVM0nD+\n' +
    'RYKIkRvhAoGBAPE0vyLXSZuE7fiYfopBlwWPfCjxDJi1gYvZcy0SaXT/1OXiy3J/\n' +
    'hxYhj6efIKly2iC5Ht5DifBYQ6GIArcoiAVTsClHg54WDaFLSQu9UQ4JNDh/3xok\n' +
    'kBvc3LHdK10Cc9+7Zu3OyssA+PKWWLaUW4Jw4t2MmXsguen6MWA6KBKXAoGBAO8Y\n' +
    'mpwvG/MZfxVHIAHXIDDnrcaOgHWKL35I4PIYbU8oYLrzDN4BFfszFr5ZDbsGW618\n' +
    'edudmPzt7avI01tFlOYwOzg9/tXOFEkFFumYIUQwE3mPrDvFeepLcjuNCpKhDyeK\n' +
    '+W8oLqI7KwtLjA1SAObmDnX1AotcIYR/0PrKk6a7AoGAS7yGL4ht4lkw55fqU7sY\n' +
    'knRlRe26SNDlJmZW1dYsKsKRtMUroH4OipJrKvS6KrqXZyL5YEzQqRjt03CDecNO\n' +
    'Qm3uqGd+GktOaFDdVMRTCRc2wG7WPL0ySq1k1qxdi0zT2XJcdVszLd7WTEWNAXc/\n' +
    '7ItJkMsu/gxek+stScu4/W0CgYEAlUWzIVd4B6ofYVVqcjuw6Vd7cr99C+UeCaXO\n' +
    'atc9R3JaEd20ZtYetxoKVQScQeuSSRmxqp8V6LNS8zEKY61pbN0n29E4zJtApuX6\n' +
    'jBRikIPDZN2CFj8QAmrgArXnp+vN3k4xtGhN1RNDqGWeJqLP1VhEJvi0gfUfJ+30\n' +
    'tt7KmAkCgYAVlAdfYYSANrksQydlaXCMyyCDRL3UJKA6cccu94ZbYZB72NWhmOJp\n' +
    '0qYxEwjAEeFmJdg2GhhdiHC4GSesS2lullaIGHRXOI2i1qY/jiI6alBUi3sMxCSJ\n' +
    'no74ikB7A0zhqXXajTdBaeTRnD7UPD3YaG8gfeA1qeRAB6MA9v/Bww==\n' +
    '-----END RSA PRIVATE KEY-----\n'
}));

function createKeyPair(options) {
  const publicKey = options.publicKey;
  const privateKey = options.privateKey;
  const ownerId = options.userId;
  const newKeyPair = {
    publicKey: {
      '@context': 'https://w3id.org/identity/v1',
      id: ownerId + '/keys/1',
      type: 'CryptographicKey',
      owner: ownerId,
      label: 'Signing Key 1',
      publicKeyPem: publicKey
    },
    privateKey: {
      type: 'CryptographicKey',
      owner: ownerId,
      label: 'Signing Key 1',
      publicKey: ownerId + '/keys/1',
      privateKeyPem: privateKey
    }
  };
  return newKeyPair;
}
