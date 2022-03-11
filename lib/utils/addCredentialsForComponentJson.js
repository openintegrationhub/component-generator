const _ = require('lodash');

module.exports = {
    escapeUrlDots: (url) => {
      return url.replace(/\./g, '%2E');
    },
    addCredentials: async (comp, api) => {
      comp.credentials = {
        fields: {},
      };
  
      let urls = api.servers
        ? api.servers.map(
            (s) => s.url + (s.description ? ' - ' + s.description : '')
          )
        : [];
      urls.push('--- Custom URL');
  
      comp.credentials.fields.server = {
        label: 'Server',
        viewClass: 'SelectView',
        model: urls,
        required: true,
      };
  
      comp.credentials.fields.otherServer = {
        label: 'Custom Server URL',
        viewClass: 'TextFieldView',
      };
  
      let schemes = api.components && api.components.securitySchemes;
      let flows = [];
      _.forOwn(schemes, (scheme, key) => {
        if (scheme.type === 'oauth2') {
          _.forOwn(scheme.flows, (flow, flowType) => {
            if (flowType !== 'authorizationCode') {
              console.error('oauth2 flow ignored:', flowType, key);
              return;
            }
            flows.push({
              ...flow,
              //key: key + ' - ' + flowType,
              key: key,
              description: scheme.description,
              scopes: _.keys(flow.scopes),
            });
          });
        }
      });
  
      if (flows.length) {
        comp.envVars = {
          OAUTH_CLIENT_ID: {
            description: 'OAuth Client ID',
          },
          OAUTH_CLIENT_SECRET: {
            description: 'OAuth Client Secret',
          },
        };
  
        if (flows.length === 1) {
          let flow = flows[0];
          comp.credentials.fields.oauth2 = {
            label: flow.description || flow.key,
            viewClass: 'OAuthFieldView',
          };
          comp.credentials.oauth2 = {
            client_id: '{{OAUTH_CLIENT_ID}}',
            client_secret: '{{OAUTH_CLIENT_SECRET}}',
            auth_uri: flow.authorizationUrl,
            token_uri: flow.tokenUrl,
            scopes: flow.scopes,
          };
        } else {
          comp.credentials.fields.OAUTH_AUTHORIZATION_URL = {
            label: 'OAuth Authorization Code URL',
            viewClass: 'SelectView',
            model: _.fromPairs(
              flows
                .filter((flow) => flow.authorizationUrl)
                .map((flow) => [
                  escapeUrlDots(flow.authorizationUrl),
                  flow.authorizationUrl +
                    '(' +
                    [flow.key, flow.description].join(' - ') +
                    ')',
                ])
            ),
          };
          comp.credentials.fields.OAUTH_TOKEN_URL = {
            label: 'OAuth Token URL',
            viewClass: 'SelectView',
            model: _.fromPairs(
              flows
                .filter((flow) => flow.tokenUrl)
                .map((flow) => [
                  escapeUrlDots(flow.tokenUrl),
                  flow.tokenUrl +
                    '(' +
                    [flow.key, flow.description].join(' - ') +
                    ')',
                ])
            ),
          };
          comp.credentials.fields.oauth2 = {
            label: 'OAuth2',
            viewClass: 'OAuthFieldView',
          };
          comp.credentials.oauth2 = {
            client_id: '{{OAUTH_CLIENT_ID}}',
            client_secret: '{{OAUTH_CLIENT_SECRET}}',
            auth_uri: '{{OAUTH_AUTHORIZATION_URL}}',
            token_uri: '{{OAUTH_TOKEN_URL}}',
            scopes: _.union(..._.map(flows, 'scopes')),
          };
        }
      }
  
      _.forOwn(schemes, (scheme, key) => {
        let fieldName = 'auth_' + key;
        if (scheme.type === 'apiKey') {
          comp.credentials.fields[fieldName] = {
            label: scheme.name + ' (' + key + ')',
            viewClass: 'TextFieldView',
            note: scheme.description,
          };
        } else if (scheme.type === 'http' && scheme.scheme === 'basic') {
          comp.credentials.fields.auth_username = {
            label: 'Username (' + key + ')',
            viewClass: 'TextFieldView',
            note: scheme.description,
          };
          comp.credentials.fields.auth_password = {
            label: 'Password (' + key + ')',
            viewClass: 'TextFieldView',
            note: scheme.description,
          };
        } else if (scheme.type === 'http' && scheme.scheme === 'bearer') {
          comp.credentials.fields[fieldName] = {
            label: key + ' (' + scheme.bearerFormat + ')',
            viewClass: 'TextFieldView',
            note: scheme.description,
          };
        } else if (scheme.type === 'oauth2') {
          //console.log('flows', json(scheme));
        } else if (scheme.type === 'openIdConnect') {
          comp.credentials.fields[key] = {
            label: key + ' (openIdConnect)',
            viewClass: 'TextFieldView',
            note: scheme.description,
          };
        }
      });
    },
  };