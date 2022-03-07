const { quote } = require('./functions');
const _ = require('lodash');

function getSecuritySchemes(api) {
  const ACTION = {};
  ACTION.SECURITIES = ['let securities = {}'];
  ACTION.TESTSECURITIES = ['let securities = {}'];
  ACTION.MYVARIABLES = [];
  let schemeArray = [];
  let secLength = Object.keys(api.components.securitySchemes).length;

  for (i = 0; i < secLength; i++) {
    let keys = Object.keys(api.components.securitySchemes);
    let current = keys[i];
    schemeArray = [
      ...schemeArray,
      api.components.securitySchemes[current].scheme,
    ];
  }
  let hasBearer = schemeArray.includes('bearer');

  let usedSecurities = {};
  for (let secReq of api.security || []) {
    _.forOwn(secReq, (sec, key) => {
      if (usedSecurities[key]) {
        return;
      }
      usedSecurities[key] = true;

      let scheme = api.components.securitySchemes[key];

      if (!scheme) {
        throw 'Security scheme not defined: ' + key;
      }
      let fieldName = 'auth_' + key;

      if (scheme.type === 'apiKey') {
        ACTION.SECURITIES.push(
          'securities[' + quote(key) + '] = cfg[' + quote('key') + ']'
        );
        ACTION.TESTSECURITIES.push(
          'securities[' + quote(key) + '] = process.env.APIKEY '
        );
        ACTION.MYVARIABLES.push('APIKEY=${{ secrets.apikey }}');
      }
      if (scheme.type === 'http' && scheme.scheme === 'basic') {
        ACTION.SECURITIES.push(
          'securities[' +
            quote(key) +
            '] = {username: cfg.username, password: cfg.passphrase}'
        );
        ACTION.TESTSECURITIES.push(
          'securities[' +
            quote(key) +
            '] = {username: process.env.USERNAME, password: process.env.PASSPHRASE }'
        );
        ACTION.MYVARIABLES.push(
          'USERNAME=${{ secrets.username }} PASSPHRASE=${{ secrets.passphrase }}'
        );
      }
      if (scheme.type === 'http' && scheme.scheme === 'bearer') {
        ACTION.SECURITIES.push(
          'securities[' + quote(key) + '] = cfg[' + quote('accessToken') + ']'
        );
        ACTION.TESTSECURITIES.push(
          'securities[' + quote(key) + '] = process.env.ACCESSTOKEN '
        );
        ACTION.MYVARIABLES.push('APIKEY=${{ secrets.accesstoken }}');
      }
      if (scheme.type === 'oauth2' && !hasBearer) {
        ACTION.SECURITIES.push(
          'securities[' +
            quote(key) +
            '] = { token: { access_token: cfg[' +
            quote('accessToken') +
            ']' +
            '} }'
        );
        ACTION.TESTSECURITIES.push(
          'securities[' +
            quote(key) +
            '] = { token: { access_token: process.env.ACCESSTOKEN  } }'
        );
        ACTION.MYVARIABLES.push('APIKEY=${{ secrets.accesstoken }}');
      }
      if (scheme.type === 'openIdConnect') {
        ACTION.SECURITIES.push('securities[' + quote(key) + '] = cfg.oauth2');
        ACTION.TESTSECURITIES.push(
          'securities[' + quote(key) + '] = process.env.OAUTH2" '
        );
        ACTION.MYVARIABLES.push('APIKEY=${{ secrets.oauth2 }}');
      }
    });
  }
  return ACTION;
}

module.exports = {
  getSecuritySchemes,
};
