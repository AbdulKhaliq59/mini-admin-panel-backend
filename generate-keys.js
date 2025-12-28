#!/usr/bin/env node

const crypto = require('crypto');

console.log('Generating RSA-2048 key pair for user data signatures...\n');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

console.log('Add these to your .env file:\n');
console.log('USER_DATA_PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"');
console.log('USER_DATA_PUBLIC_KEY="' + publicKey.replace(/\n/g, '\\n') + '"');
console.log('\n⚠️  WARNING: Once set, DO NOT regenerate these keys as it will invalidate all existing user signatures!');
