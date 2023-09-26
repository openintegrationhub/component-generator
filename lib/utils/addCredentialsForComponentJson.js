const _ = require("lodash");

function escapeUrlDots(url) {
  return url.replace(/\./g, "%2E");
}

module.exports = {
  escapeUrlDots,

  /**
   * Create a list of security schemes if they are not found in the original OpenAPI description
   * @param {string[]} schemeNames
   * @returns {{newSchemes: {}, securityScheme: *[]}}
   */
  createSecuritySchemes: (schemeNames) => {
    let securityScheme = [];
    for (const scheme of schemeNames) {
      const newSchemes = {};
      switch (scheme) {
        case "apiKey":
        case "api_key":
        case "ApiKey":
        case "apikey":
        case "api_token":
          newSchemes[scheme] = {
            type: "apiKey",
            name: "Authorization",
            in: "header",
          };
          securityScheme = [...securityScheme, { [scheme]: [] }];
          break;
        case "basicAuth":
        case "BasicAuth":
          newSchemes[scheme] = {
            type: "http",
            description: "You can access this resource via basic auth.",
            scheme: "basic",
          };
          securityScheme = [...securityScheme, { [scheme]: [] }];
          break;
        case "bearerAuth":
        case "BearerAuth":
          newSchemes[scheme] = {
            bearerFormat: "auth-scheme",
            description: "Bearer HTTP authentication. Allowed headers-- Authorization: Bearer <api_key>",
            scheme: "bearer",
            type: "http",
          };
          securityScheme = [...securityScheme, { [scheme]: [] }];
          break;
        case "oauth2":
        case "OAuth2":
          newSchemes[scheme] = {
            type: "oauth2",
            description:
              "We require that applications designed to access the API on behalf of multiple users implement OAuth 2.0.",
            flows: {
              authorizationCode: {
                authorizationUrl: "",
                tokenUrl: "",
                refreshUrl: "",
                scopes: {
                  default:
                    "Provides access to all endpoints documented in our API reference. If no scopes are requested, this scope is assumed by default.",
                  openid: "Provides access to OpenID Connect ID tokens and the OpenID Connect user info endpoint.",
                  email: "Provides access to the user’s email through the OpenID Connect user info endpoint.",
                  profile:
                    "Provides access to the user’s name and profile photo through the OpenID Connect user info endpoint.",
                },
              },
            },
          };
          securityScheme = [...securityScheme, { [scheme]: [] }];
          break;
        default:
          throw new Error(`Unknown security scheme: ${scheme}`);
      }
      return { newSchemes, securityScheme };
    }
  },
  addCredentials: async (comp, api) => {
    comp.credentials = {
      fields: {},
    };

    let urls = api.servers ? api.servers.map((s) => s.url + (s.description ? " - " + s.description : "")) : [];
    urls.push("--- Custom URL");

    comp.credentials.fields.server = {
      label: "Server",
      viewClass: "SelectView",
      model: urls,
      required: true,
    };

    comp.credentials.fields.otherServer = {
      label: "Custom Server URL",
      viewClass: "TextFieldView",
    };
    let schemes;
    if (api.components) {
      schemes = api.components && api.components.securitySchemes;
    }
    // console.log("here ",schemes);
    let flows = [];
    _.forOwn(schemes, (scheme, key) => {
      if (scheme.type === "oauth2") {
        _.forOwn(scheme.flows, (flow, flowType) => {
          if (flowType !== "authorizationCode") {
            console.error("oauth2 flow ignored:", flowType, key);
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
          description: "OAuth Client ID",
        },
        OAUTH_CLIENT_SECRET: {
          description: "OAuth Client Secret",
        },
      };

      if (flows.length === 1) {
        let flow = flows[0];
        comp.credentials.fields.oauth2 = {
          label: flow.description || flow.key,
          viewClass: "OAuthFieldView",
        };
        comp.credentials.oauth2 = {
          client_id: "{{OAUTH_CLIENT_ID}}",
          client_secret: "{{OAUTH_CLIENT_SECRET}}",
          auth_uri: flow.authorizationUrl,
          token_uri: flow.tokenUrl,
          scopes: flow.scopes,
        };
      } else {
        comp.credentials.fields.OAUTH_AUTHORIZATION_URL = {
          label: "OAuth Authorization Code URL",
          viewClass: "SelectView",
          model: _.fromPairs(
            flows
              .filter((flow) => flow.authorizationUrl)
              .map((flow) => [
                escapeUrlDots(flow.authorizationUrl),
                flow.authorizationUrl + "(" + [flow.key, flow.description].join(" - ") + ")",
              ])
          ),
        };
        comp.credentials.fields.OAUTH_TOKEN_URL = {
          label: "OAuth Token URL",
          viewClass: "SelectView",
          model: _.fromPairs(
            flows
              .filter((flow) => flow.tokenUrl)
              .map((flow) => [
                escapeUrlDots(flow.tokenUrl),
                flow.tokenUrl + "(" + [flow.key, flow.description].join(" - ") + ")",
              ])
          ),
        };
        comp.credentials.fields.oauth2 = {
          label: "OAuth2",
          viewClass: "OAuthFieldView",
        };

        comp.credentials.oauth2 = {
          client_id: "{{OAUTH_CLIENT_ID}}",
          client_secret: "{{OAUTH_CLIENT_SECRET}}",
          // auth_uri: "{{OAUTH_AUTHORIZATION_URL}}",
          // token_uri: "{{OAUTH_TOKEN_URL}}",
          auth_uri: flows[0].authorizationUrl,
          token_uri: flows[0].tokenUrl,
          scopes: _.union(..._.map(flows, "scopes")),
        };
      }
    }

    _.forOwn(schemes, (scheme, key) => {
      let fieldName = "auth_" + key;
      if (scheme.type === "apiKey") {
        comp.credentials.fields[fieldName] = {
          label: scheme.name + " (" + key + ")",
          viewClass: "TextFieldView",
          note: scheme.description,
        };
      } else if (scheme.type === "http" && scheme.scheme === "basic") {
        comp.credentials.fields.auth_username = {
          label: "Username (" + key + ")",
          viewClass: "TextFieldView",
          note: scheme.description,
        };
        comp.credentials.fields.auth_password = {
          label: "Password (" + key + ")",
          viewClass: "TextFieldView",
          note: scheme.description,
        };
      } else if (scheme.type === "http" && scheme.scheme === "bearer") {
        comp.credentials.fields[fieldName] = {
          label: key + " (" + scheme.bearerFormat + ")",
          viewClass: "TextFieldView",
          note: scheme.description,
        };
      } else if (scheme.type === "oauth2") {
        //console.log('flows', json(scheme));
      } else if (scheme.type === "openIdConnect") {
        comp.credentials.fields[key] = {
          label: key + " (openIdConnect)",
          viewClass: "TextFieldView",
          note: scheme.description,
        };
      }
    });
  },
};
