/*
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const config = bedrock.config;
const helpers = require('./helpers');

const data = {};
module.exports = data;

const identities = data.identities = {};
let userName;

// identity with permission to access its own agreements
userName = 'regularUser';
identities[userName] = {};
identities[userName].identity = helpers.createIdentity(
  userName, {did: 'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794'});
identities[userName].identity.sysResourceRole.push({
  sysRole: 'bedrock-auth-did-jwt.test',
  generateResource: 'id'
});
identities[userName].keys = helpers.createKeyPair({
  userName: userName,
  userId: identities[userName].identity.id,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqv8gApfU3FhZx1gyKmBU\n' +
    'czZ1Ba3DQbqcGRJiwWz6wrr9E/K0PcpRws/+GPc1znG4cKLdxkdyA2zROUt/lbaM\n' +
    'TU+/kZzRh3ICZZOuo8kJpGqxPDIm7L1lIcBLOWu/UEV2VaWNOENwiQbh61VJlR+k\n' +
    'HK9LhQxYYZT554MYaXzcSRTC/RzHDTAocf+B1go8tawPEixgs93+HHXoLPGypmqn\n' +
    'lBKAjmGMwizbWFccDQqv0yZfAFpdVY2MNKlDSUNMnZyUgBZNpGOGPm9zi9aMFT2d\n' +
    'DrN9fpWMdu0QeZrJrDHzk6TKwtKrBB9xNMuHGYdPxy8Ix0uNmUt0mqt6H5Vhl4O0\n' +
    '0QIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpQIBAAKCAQEAqv8gApfU3FhZx1gyKmBUczZ1Ba3DQbqcGRJiwWz6wrr9E/K0\n' +
    'PcpRws/+GPc1znG4cKLdxkdyA2zROUt/lbaMTU+/kZzRh3ICZZOuo8kJpGqxPDIm\n' +
    '7L1lIcBLOWu/UEV2VaWNOENwiQbh61VJlR+kHK9LhQxYYZT554MYaXzcSRTC/RzH\n' +
    'DTAocf+B1go8tawPEixgs93+HHXoLPGypmqnlBKAjmGMwizbWFccDQqv0yZfAFpd\n' +
    'VY2MNKlDSUNMnZyUgBZNpGOGPm9zi9aMFT2dDrN9fpWMdu0QeZrJrDHzk6TKwtKr\n' +
    'BB9xNMuHGYdPxy8Ix0uNmUt0mqt6H5Vhl4O00QIDAQABAoIBAQCpA3yXM42AsY8j\n' +
    'mwgSnJ48NqJaF5L8P7+UhHi6KMZ+fSYydl0zCevge4bzFD3JrNuZ8VD1b57AxejT\n' +
    'Ec2so/9vVxjJi1AK6WR3FA608rumGJLQJd4Vd2ojfxabTeWOKOo642R/LSFpPzVE\n' +
    'T0toqxqiA53IhxhAc2jDLO+PLIvrao0Y8bWWq36tbxsAplrv8Gms6ZRwfKoX5P32\n' +
    'azBpJOqneNdSMRPHky6t2uiYyuPeG9pbuaClkD7Ss9lpH0V1DLQmAAlP9I0Aa06B\n' +
    'a9zPFPb3Ae8F0HO/tsf8gIvrlT38JvLe5VuCS7/LQNCZguyPZuZOXLDmdETfm1FD\n' +
    'q56rCV7VAoGBANmQ7EqDfxmUygTXlqaCQqNzY5pYKItM6RFHc9I+ADBWsLbuKtfP\n' +
    'XUMHQx6PvwCMBpjZkM7doGdzOHb0l3rW8zQONayqQxN9Pjd7K+dkSY6k0SScw46w\n' +
    '0AexDQSM/0ahVAHfXXi1GbKwlonM0nn/7JHz7n/fL9HwV8T3hAGClbPDAoGBAMk0\n' +
    'K5d+Ov55sKW0ZatZ0vTnfBCSrVEfG6FkcyK7uiSsMdWo2/De0VtJF7od2DM5UyP6\n' +
    'Y/DSVk4oPepbug5oGdu8t1Q3jbS61A7i/dssirQC4hEFAtoTGsVfaH8wu4AKyWd7\n' +
    '0rUmSrnyqNr4mfQBjdaXByvWO9rdEfZcZqaSQ4/bAoGAKy/CR7Q8eYZ4Z2eoBtta\n' +
    'gPl5rvyK58PXi8+EJRqbjPzYTSePp5EI8TIy15EvF9uzv4mIXhfOLFrJvYsluoOK\n' +
    'eS3M575QXEEDJZ40g9T7aO48eakIhH2CfdReQiX+0jVZ6Jk/A6PnOvokl6vpp7/u\n' +
    'ZLZoBEf4RRMRSQ7czDPwpWMCgYEAlNWZtWuz+hBMgpcqahF9AprF5ICL4qkvSDjF\n' +
    'Dpltfbk+9/z8DXbVyUANZCi1iFbMUJ3lFfyRySjtfBI0VHnfPvOfbZXWpi1ZtlVl\n' +
    'UZ7mT3ief9aEIIrnT79ezk9fM71G9NzcphHYTyrYi3pAcAZCRM3diSjlh+XmZqY9\n' +
    'bNRfU+cCgYEAoBYwp0PJ1QEp3lSmb+gJiTxfNwIrP+VLkWYzPREpSbghDYjE2DfC\n' +
    'M8pNbVWpnOfT7OlhN3jw8pxHWap6PxNyVT2W/1AHNGKTK/BfFVn3nVGhOgPgH1AO\n' +
    'sObYxm9gpkNkelXejA/trbLe4hg7RWNYzOztbfbZakdVjMNfXnyw+Q0=\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

data.sinon = {
  publicKey: {
    "publicKeyPem": '-----BEGIN PUBLIC KEY-----\n' +
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4UdtEFXEWonMj04Rca37\n' +
        'IvGFJIgPakvjK9VNrLog1YkBMQo+kqo1WWJndFoB1mEROtID+LLYCfshHwvR/n5R\n' +
        'StNqPV2/DMMnZb0s3kJ88wyjnDOdCA6eYO7ugjZKBvFfjxbDDFARaBJN7pBECDMw\n' +
        'cvXLsZAs+/bTOOR+/ebXHfuY9uqx0XyyEmLq+mTEJm6MaZKCNmoj0l6IatmGeePm\n' +
        'ZXqd+dAXJew7RNI8wyEiD8VI186a3asOMnV/IvU8PAZImaLPqt/jN9HI7SflrPEI\n' +
        'LWQCUN0Td0qRV09JRMo60CR/c1b3Mwae9A7WQpWRbaEMCbsGtoCLz03dEVIkSgh+\n' +
        'TQIDAQAB\n' +
        '-----END PUBLIC KEY-----\n',
    "owner": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58",
    "id": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58/keys/1",
    "sysStatus": "active",
    "label": "Key NaN",
    "type": "CryptographicKey"
  }
};

data.didDocuments = {
  // DDO for mock identity
  'did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794': {
    "@context": "https://w3id.org/identity/v1",
    "id": "did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794",
    "idp": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58",
    "accessControl": {
      "writePermission": [
        {
          "id": "did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794/keys/1",
          "type": "CryptographicKey"
        },
        {
          "id": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58",
          "type": "Identity"
        }
      ]
    },
    "publicKey": [
      {
        "id": "did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794/keys/1",
        "type": "CryptographicKey",
        "owner": "did:c72440d1-ad6b-47c2-9b78-cd5e7d5c6794",
        "publicKeyPem": "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlNthygoi1J5gj5i0Gmnv\r\noFBlTRg3oMoMhmj0OHRpFQf2igliNrzxtjNEZBK3WAbcBGHonNBS1MsxKSoHaS4N\r\ncJiu3Wq4DX6MJzDKZuNkah1sxSUtS2owAfO1QzdCxiHNyqDFr1rnoJqIYx+NfQoa\r\nLQn3MU1ymppFIK/yUp/ya/22KCFDohkmwMxkda8J2FHBun9ReZubZVVn6Yb7AkOg\r\np1pb2TFzph/va9QHXIghU0MEesW+V3dMveK3ZYenRSsEWFthysxrxiXlPTBFsgWl\r\n3vbBcWnAeGbYyUW1gVeKXoOUvCwKf51eomC0By4DaJyGPeXugW3dk3PHvGIWYmPH\r\nIQIDAQAB\r\n-----END PUBLIC KEY-----\r\n"
      }
    ],
    "signature": {
      "type": "LinkedDataSignature2015",
      "created": "2016-03-25T14:27:42Z",
      "creator": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58/keys/1",
      "signatureValue": "AA5YSshFnzlKxFgj4FhZAS7vPAOG5IyPBEkVjdfsCpoKRAjlN/Qy2+noM+i7nQIBOSQ2FFmFHAce3GCTLnBMgMnkTRKgT6ABHX3WKv9k59FAkXrrKHR/B/T73XTkT5Xe2Jkigp/RMmQvhb7BaGDPI8CY8QIjkM2RFIPsdoxIWSKtljk/nPcfg20Fis/6K6JVmWvRGUmt4KvGEjiVtNreGb6bppkrt8fLh8HXWuhAozTw6kTv27n/Z2DfeiP9zp556gQJ9zGmD4YaJHcWkOWW0lXAZ6iKKc6LWVKcUEubVG3sjK2yag/Ft5qt8DYbelCkV0oM7sNyqUIBym0+Zd0+uw=="
    },
    "url": "https://example.com"
  },
  // DDO for mock IdP
  'did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58': {
    "@context": "https://w3id.org/identity/v1",
    "id": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58",
    "idp": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58",
    "accessControl": {
      "writePermission": [
        {
          "id": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58/keys/1",
          "type": "CryptographicKey"
        }
      ]
    },
    "publicKey": [
      {
        "id": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58/keys/1",
        "type": "CryptographicKey",
        "owner": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58",
        "publicKeyPem": "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4UdtEFXEWonMj04Rca37\n" +
    "IvGFJIgPakvjK9VNrLog1YkBMQo+kqo1WWJndFoB1mEROtID+LLYCfshHwvR/n5R\n" +
    "StNqPV2/DMMnZb0s3kJ88wyjnDOdCA6eYO7ugjZKBvFfjxbDDFARaBJN7pBECDMw\n" +
    "cvXLsZAs+/bTOOR+/ebXHfuY9uqx0XyyEmLq+mTEJm6MaZKCNmoj0l6IatmGeePm\n" +
    "ZXqd+dAXJew7RNI8wyEiD8VI186a3asOMnV/IvU8PAZImaLPqt/jN9HI7SflrPEI\n" +
    "LWQCUN0Td0qRV09JRMo60CR/c1b3Mwae9A7WQpWRbaEMCbsGtoCLz03dEVIkSgh+\n" +
    "TQIDAQAB\n" +
    "-----END PUBLIC KEY-----\n"
      }
    ],
    "signature": {
      "type": "LinkedDataSignature2015",
      "created": "2016-03-25T14:27:42Z",
      "creator": "did:1deb8074-8f4c-4a92-bc0f-de45e4b5bf58/keys/1",
      "signatureValue": "AA5YSshFnzlKxFgj4FhZAS7vPAOG5IyPBEkVjdfsCpoKRAjlN/Qy2+noM+i7nQIBOSQ2FFmFHAce3GCTLnBMgMnkTRKgT6ABHX3WKv9k59FAkXrrKHR/B/T73XTkT5Xe2Jkigp/RMmQvhb7BaGDPI8CY8QIjkM2RFIPsdoxIWSKtljk/nPcfg20Fis/6K6JVmWvRGUmt4KvGEjiVtNreGb6bppkrt8fLh8HXWuhAozTw6kTv27n/Z2DfeiP9zp556gQJ9zGmD4YaJHcWkOWW0lXAZ6iKKc6LWVKcUEubVG3sjK2yag/Ft5qt8DYbelCkV0oM7sNyqUIBym0+Zd0+uw=="
    },
    "url": "https://idp.example.com"
  }
};

const jsonld = bedrock.jsonld;
const oldLoader = jsonld.documentLoader;
jsonld.documentLoader = function(url, callback) {
  const regex = new RegExp(
    config.passport.strategies.did.didio.baseUrl + '(.*?)$');
  const didMatch = url.match(regex);
  if(didMatch && didMatch.length === 2 &&
    didMatch[1] in data.didDocuments) {
    return callback(
      null, {
        contextUrl: null,
        document: data.didDocuments[didMatch[1]],
        documentUrl: url
      });
  }
  oldLoader(url, callback);
};
