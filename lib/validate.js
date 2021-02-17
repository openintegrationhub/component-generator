/**
 * : OIH-openapi-component-generator
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const fse = require('fs-extra');
const _ = require('lodash');
const SwaggerParser = require('swagger-parser');
const {URL} = require('url');
const converter = require('swagger2openapi');

/**
 * Validates and fixes a swagger definition
 * @param {object} opts - named arguments
 * @param {string} opts.inputFile - path to a local json or yaml file containing the swagger def to validate and fix
 * @param {string} [opts.swaggerUrl] - swagger definition url; used to fill out missing server data
 * @param {string} opts.outputFile - path to a local file to save the fixed definition to
 * @param {function} [opts.reportWarning] - report validation warnings to the caller
 * @returns {Promise<T>}
 */
module.exports = function validate(opts) {
    if(!opts.inputFile) throw new Error('inputFile not specified');
    if(!opts.outputFile) throw new Error('outputFile not specified');

    let parser = new SwaggerParser();

    return parser.validate(opts.inputFile, {dereference: {circular: 'ignore'}}).then(api => {
        if (api.swagger) {
            // this spec is openapi version 2 (swagger)

            // fill missing server information from the spec url
            if (opts.swaggerUrl && (!api.schemes || !api.host || !api.basePath)) {
                let parsedUrl = new URL(opts.swaggerUrl);
                if (!api.schemes) {
                    api.schemes = parsedUrl.protocol;
                }
                if (!api.host) {
                    api.host = parsedUrl.host;
                }
                if (!api.basePath) {
                    api.basePath = '/';
                }
            }

            // convert to openapi 3
            return converter.convertObj(api, {
                patch: true,
                warnOnly: true,
                anchors: true,
            })
            .then(options => options.openapi)
            .then(api => parser.dereference(api, {dereference: {circular: 'ignore'}}));
        }
        return api;
    }).then(api => {
        reportWarning(fixSecurityRequirements(api));
        reportWarning(checkIfMultipleOauthFlows(api));
        reportWarning(fixOauthImplicitFlows(api));
        return fse.writeJSON(opts.outputFile, api, {spaces: 4});
    });

    function reportWarning(message) {
        opts.reportWarning && message && opts.reportWarning(message);
    }
};

// some apis do not specify any security requirement objects, although they define security schemes. Use them all in those cases.
function fixSecurityRequirements(api) {
    if(!api.components || _.isEmpty(api.components.securitySchemes) || !_.isEmpty(api.security)) {
        return;
    }

    for(let path in api.paths) {
        for(let method in api.paths[path]) {
            if(!_.isEmpty(api.paths[path][method].security)) {
                return;
            }
        }
    }

    api.security = _.keys(api.components.securitySchemes).map(key => ({[key]: []}));

    return 'Security schemes defined but not used.';
}

function checkIfMultipleOauthFlows(api) {
    let schemes = api.components && api.components.securitySchemes;
    if(!schemes) { return; }
    for(let key in schemes) {
        let scheme = schemes[key];
        if(scheme.type === 'oauth2' && _.keys(scheme.flows).length > 1) {
            return 'Multiple OAuth2 flows defined (' + _.keys(scheme.flows).length + ').';
        }
    }
}

function fixOauthImplicitFlows(api) {
    let schemes = api.components && api.components.securitySchemes;
    if(!schemes) { return; }

    let tokenUrl;

    if(api.info['x-providerName'] === 'googleapis.com') {
        tokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
    }
    else if(api.info['x-providerName'] === 'azure.com') {
        tokenUrl = 'https://login.microsoftonline.com/common/oauth2/token';
    }

    if(tokenUrl) {
        for (let key in schemes) {
            let scheme = schemes[key];
            if (scheme.type === 'oauth2' && scheme.flows && scheme.flows.implicit) {
                scheme.flows.authorizationCode = scheme.flows.implicit;
                scheme.flows.authorizationCode.tokenUrl = tokenUrl;
                delete scheme.flows.implicit;
                return 'implicit->code';
            }
        }
    }
}


