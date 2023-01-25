const { quote } = require("./functions");
const _ = require("lodash");
const { createSecuritySchemes } = require("./addCredentialsForComponentJson");
const prompt = require("prompt-sync")();

function getActionAndSecuritySchemes(api, apiTitle, packageName, snapshot) {
  const ACTION = {
    API_TITLE: apiTitle,
    PACKAGE_NAME: packageName,
    FIELD_MAP: {},
    NOW: new Date().toISOString(),
    GENERATOR_VERSION: require("../../package.json").version,
    SNAPSHOT: quote(snapshot),
  };
  ACTION.SECURITIES = ["let securities = {}"];
  ACTION.TESTSECURITIES = ["let securities = {}"];
  ACTION.MYVARIABLES = [];
  let schemeArray = [];
  let secLength = Object.keys(api.components.securitySchemes).length;
  if (!api.security) {
    const securityKeys = Object.keys(api.components.securitySchemes);
    api.security = securityKeys.map((s) => {
      return {
        [s]: [],
      };
    });
  }
  if (secLength === 0) {
    const securities = prompt("What is your security scheme/s ex. ( BasicAuth apiKey OAuth2 )? ");
    const secTypes = securities.split(" ");
    const { newSchemes, securityScheme } = createSecuritySchemes(secTypes);
    api.components.securitySchemes = newSchemes;
    api.security = [...securityScheme];
    secLength = Object.keys(api.components.securitySchemes).length;
  }

  for (let i = 0; i < secLength; i++) {
    let keys = Object.keys(api.components.securitySchemes);
    let current = keys[i];
    schemeArray = [...schemeArray, api.components.securitySchemes[current].scheme];
  }
  let hasBearer = schemeArray.includes("bearer");

  let usedSecurities = {};
  for (let secReq of api.security || []) {
    _.forOwn(secReq, (sec, key) => {
      if (usedSecurities[key]) {
        return;
      }
      usedSecurities[key] = true;

      let scheme = api.components.securitySchemes[key];

      if (!scheme) {
        throw "Security scheme not defined: " + key;
      }
      let fieldName = "auth_" + key;

      if (scheme.type === "apiKey") {
        ACTION.SECURITIES.push("securities[" + quote(key) + "] = cfg[" + quote("key") + "]");
        ACTION.TESTSECURITIES.push("securities[" + quote(key) + "] = process.env.APIKEY ");
        ACTION.MYVARIABLES.push("APIKEY=${{ secrets.apikey }}");
      }
      if (scheme.type === "http" && scheme.scheme === "basic") {
        ACTION.SECURITIES.push("securities[" + quote(key) + "] = {username: cfg.username, password: cfg.passphrase}");
        ACTION.TESTSECURITIES.push(
          "securities[" + quote(key) + "] = {username: process.env.USERNAME, password: process.env.PASSPHRASE }"
        );
        ACTION.MYVARIABLES.push("USERNAME=${{ secrets.username }} PASSPHRASE=${{ secrets.passphrase }}");
      }
      if (scheme.type === "http" && scheme.scheme === "bearer") {
        ACTION.SECURITIES.push("securities[" + quote(key) + "] = cfg[" + quote("accessToken") + "]");
        ACTION.TESTSECURITIES.push("securities[" + quote(key) + "] = process.env.ACCESSTOKEN ");
        ACTION.MYVARIABLES.push("APIKEY=${{ secrets.accesstoken }}");
      }
      if (scheme.type === "oauth2" && !hasBearer) {
        ACTION.SECURITIES.push(
          "securities[" + quote(key) + "] = { token: { access_token: cfg[" + quote("accessToken") + "]" + "} }"
        );
        ACTION.TESTSECURITIES.push(
          "securities[" + quote(key) + "] = { token: { access_token: process.env.ACCESSTOKEN  } }"
        );
        ACTION.MYVARIABLES.push("APIKEY=${{ secrets.accesstoken }}");
      }
      if (scheme.type === "openIdConnect") {
        ACTION.SECURITIES.push("securities[" + quote(key) + "] = cfg.oauth2");
        ACTION.TESTSECURITIES.push("securities[" + quote(key) + '] = process.env.OAUTH2" ');
        ACTION.MYVARIABLES.push("APIKEY=${{ secrets.oauth2 }}");
      }
    });
  }
  ACTION.SECURITIES = ACTION.SECURITIES.join(";\n  ");
  ACTION.TESTSECURITIES = ACTION.TESTSECURITIES.join(";\n  ");

  return ACTION;
}

module.exports = {
  getActionAndSecuritySchemes,
};
