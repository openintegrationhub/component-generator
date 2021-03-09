/**
 * : OIH-openapi-component-generator
 * Copyright © 2020,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const path = require('path');

const SwaggerParser = require('swagger-parser');
const semver = require('semver');
const fse = require('fs-extra');
const request = require('./request');
const mediaTypeParser = require('media-type');
const _ = require('lodash');
const jimp = require('jimp');
const gm = require('gm').subClass({appPath: require('graphicsmagick-static').path + '/'});
const {transliterate} = require('transliteration');
const moment = require('moment');
const htmlToText = require('html-to-text');
const scripts = require('./scripts');

const actionTemplate = readTemplate('action.js');
const componentTemplate = readTemplate('component.json');
const packageTemplate = readTemplate('package.json');
const readmeTemplate = readTemplate('README.md');
const triggerTemplate = readTemplate('trigger.js');
const wrapperTemplate = readTemplate('process-wrapper.js');


function readTemplate(file) { return fse.readFileSync(path.join(__dirname, '..', 'templates', file), 'utf-8'); }

/**
 * Generate a connector
 *
 * @param {object} opts - named arguments
 * @param {string} opts.inputFile - path to local validated swagger definition file
 * @param {string} opts.outputDir - path to the folder where the generated connector files will be saved
 * @param {string} opts.packageName - name to use in generated package.json
 * @param {string} [opts.swaggerUrl] - swagger definition url
 * @param {boolean} [opts.suffixServiceNameToTitle=false] - if true, suffix service name to api title (to differentiate between apis with the same title)
 * @returns {Promise} - resolves when the generation is done; rejected when there is an error during generation
 */
module.exports = async function generate({inputFile, outputDir, packageName, swaggerUrl, suffixServiceNameToTitle=false}) {
    let api = await SwaggerParser.parse(inputFile);
    let apiTitle = api.info.title + (suffixServiceNameToTitle ? ' (' + api.info['x-serviceName'] + ')' : '');
    
    let waitFor = [];

    if (!swaggerUrl || !swaggerUrl.match(/^https?:\/\//)) {
        swaggerUrl = api.servers[0].url;
    }

    if (fse.existsSync(outputDir)) {
        fse.removeSync(outputDir);
    }

    output('lib/spec.json', api);

    copyTemplate('.gitignore', '.gitignore');
    copyTemplate('LICENSE', 'LICENSE');
    copyTemplate('COPYING', 'COPYING');
    copyTemplate('LICENSING', 'LICENSING');
    copyTemplate('.dockerignore','.dockerignore');
    copyTemplate('Dockerfile','Dockerfile');
    output('lib/triggers/startFlow.js', triggerTemplate, {packageName: packageName});
    output('lib/services/process-wrapper.js', wrapperTemplate, {packageName: packageName});
    

    let xLogo = api.info['x-logo'];
    if (xLogo && xLogo.url) {
        let logoUrl = xLogo.url;
        let logoPng = path.join(outputDir, filename('logo.png'));
        if (logoUrl.endsWith('.svg')) {
            waitFor.push(new Promise((resolve) => {
                gm(request(logoUrl)).resize(60, 60).write(logoPng, function (err) {
                    if (err) {
                        console.error('error converting logo, using default logo', err);
                        copyTemplate('logo.png', 'logo.png'); // default logo
                        //return reject(err);
                    }
                    resolve();
                });
            }));
        }
        else {
            waitFor.push(jimp.read(logoUrl).then(logo => {
                return logo.contain(60, 60).writeAsync(logoPng);
            }).catch(err => {
                console.error('error converting logo, using default logo', err);
                copyTemplate('logo.png', 'logo.png'); // default logo
            }));
        }
    } else {
        copyTemplate('logo.png', 'logo.png'); // default logo
    }

    let version = api.info.version;
    let sv = semver.coerce(api.info.version);
    if (!sv) {
        version = '0.0.1';
        console.log('Bad version:', api.info.version);
        console.log('Using dummy version:', version);
    }
    else {
        version = sv.version;
    }

    let textDescription = toText(api.info.description);

    

    output('package.json', Object.assign(JSON.parse(packageTemplate), {
        name: packageName,
        version: version,
        description: textDescription,
        scripts: scripts
    }));

    let componentJson = Object.assign(JSON.parse(componentTemplate), {
        title: apiTitle,
        description: textDescription,
        docsUrl: api.externalDocs && api.externalDocs.url || '',
        url: swaggerUrl,
    });

    addCredentials(componentJson, api);

    // generate actions
    let existingNames = {};
    _.forOwn(api.paths, (operations, opPath) => {
        if (opPath[0] !== '/') {
            return;
        } // skip x-* fields
        let pathParams = operations.parameters || {};

        _.forOwn(operations, (operation, method) => {
            if (method === 'parameters') {
                return;
            }
            let name = operation.operationId || (method + opPath);
            name = name.replace(/[^a-z0-9_]/ig, '_');
            if (!name.match(/^[a-z]/i)) {
                name = 'action_' + name;
            }
            if (existingNames[name]) {
                name = name + '_' + (existingNames[name]++);
            }
            existingNames[name] = 1;

            let ACTION = {
                API_TITLE: apiTitle,
                PACKAGE_NAME: packageName,
                OPERATION_ID: quote(operation.operationId),
                METHOD: quote(method),
                PATH: quote(opPath),
                PARAMETERS: [],
                FIELD_MAP: {},
                NOW: new Date().toISOString(),
                GENERATOR_VERSION: require('../package.json').version,

            };
            // console.log("ACTION:",ACTION);
            let nameForFile = name.slice(0, 100);
            let schemaInFile = filename('lib/schemas', nameForFile + '.in.json');
            let schemaOutFile = filename('lib/schemas', nameForFile + '.out.json');
            let action = {
                main: filename('lib/actions', nameForFile + '.js'),
                title: toText(operation.summary || operation.operationId || operation.description || name),
                description: toText(operation.description),
                fields: {
                    verbose: {
                        viewClass: 'CheckBoxView',
                        label: 'Debug this step (log more data)',
                    }
                },
                metadata: {
                    in: schemaInFile,
                    out: schemaOutFile, //schemaOutFile,
                },
                $$$params: [],
                $$$tags: operation.tags,
                $$$title: _.trim(operation.summary || operation.operationId || operation.description || name),
                $$$description: _.trim(operation.description),
            };
            // console.log("ACTION:",action);

            let schema = {
                type: 'object',
                properties: {}
            };
            _.each(Object.assign({}, pathParams, operation.parameters), param => {
                ACTION.PARAMETERS.push(param.name);
                schema.properties[param.name] = Object.assign({
                    required: param.required,
                }, param.schema);
                action.$$$params.push(param);
            });
            ACTION.PARAMETERS = json(ACTION.PARAMETERS);


            ACTION.CONTENT_TYPE = 'undefined';

            if (operation.requestBody) {
                let contentTypes = [];

                _.forOwn(operation.requestBody.content, (content, contentType) => {
                    if (!schema.properties.requestBody) {
                        schema.properties.requestBody = content.schema;
                    }

                    contentTypes.push(contentType);
                    let type = mediaTypeParser.fromString(contentType);
                    if (type.subtype === 'json' || type.suffix === 'json') {
                        schema.properties.requestBody = content.schema;
                    }
                });

                let rb = schema.properties.requestBody;
                if (rb && rb.properties && !rb.type) {
                    rb.type = 'object'; // missing in some, eg. adyen-com-fund-service
                }

                if (contentTypes.length > 1) {
                    ACTION.CONTENT_TYPE = 'cfg.body_content_type';
                    action.fields.body_content_type = {
                        viewClass: 'SelectView',
                        label: 'Body Content-Type',
                        required: true,
                        prompt: 'Choose a body Content-Type.',
                        model: _.zipObject(contentTypes.map(ct => ct.replace(/\./g, '%2E')), contentTypes)
                    };
                } else if (contentTypes.length === 1) {
                    ACTION.CONTENT_TYPE = `'${contentTypes[0]}'`;
                }
            }

            mapSchemaFieldNames(schema, ACTION.FIELD_MAP);
            ACTION.FIELD_MAP = json(ACTION.FIELD_MAP);

            output(schemaInFile, schema);
            output(schemaOutFile, schema);

            ACTION.SECURITIES = ['let securities = {}'];

            let usedSecurities = {};
            for (let secReq of operation.security || api.security || []) {
                _.forOwn(secReq, (sec, key) => {
                    if (usedSecurities[key]) {
                        return;
                    }
                    usedSecurities[key] = true;

                    let scheme = api.components.securitySchemes[key];
                    if(!scheme) {
                        throw 'Security scheme not defined: ' + key;
                    }
                    let fieldName = 'auth_' + key;

                    if (scheme.type === 'apiKey') {
                        ACTION.SECURITIES.push('securities[' + quote(key) + '] = cfg[' + quote(fieldName) + ']');
                    }
                    if (scheme.type === 'http' && scheme.scheme === 'basic') {
                        ACTION.SECURITIES.push('securities[' + quote(key) + '] = {username: cfg.auth_username, password: cfg.auth_password};');
                    }
                    if (scheme.type === 'http' && scheme.scheme === 'bearer') {
                        ACTION.SECURITIES.push('securities[' + quote(key) + '] = cfg[' + quote(fieldName) + ']');
                    }
                    if (scheme.type === 'oauth2') {
                        ACTION.SECURITIES.push('securities[' + quote(key) + '] = {token: cfg[' + quote(fieldName) + ']}');
                    }
                    if (scheme.type === 'openIdConnect') {
                        ACTION.SECURITIES.push('securities[' + quote(key) + '] = cfg.oauth2');
                    }
                });
            }
            ACTION.SECURITIES = ACTION.SECURITIES.join(';\n    ') + ';';
            

            outputAction(nameForFile, ACTION);

            componentJson.actions[name] = action;
        });
    });

    transliterateObject(componentJson);
    output('component.json', componentJson);

    output('README.md', readmeTemplate, {
        api: api,
        openapiUrl: swaggerUrl,
        moment: moment,
        componentJson: componentJson,
        packageName: packageName,
        toText: toText,
        toMD: toMD,
    });

    //console.log('Done.');

    return Promise.all(waitFor);

    function filename(...parts) {
        return './' + path.posix.join(...parts);
    }

    // output(filename, text) -> simply outputs the text
    // output(filename, text, data) -> uses text as a template and interpolates the data using lodash syntax https://lodash.com/docs/4.17.11#template
    // output(filename, data) -> outputs data as JSON
    function output(filename, text, data) {
        if (data) {
            text = _.template(text, {})(data);
        }
        else if (typeof text !== 'string') {
            text = JSON.stringify(
                text,
                (key, value) => key.startsWith('$') ? undefined : value,
                4
            );
        }

        //console.log('Writing file %s', filename);
        waitFor.push(fse.outputFile(path.join(outputDir, filename), text));
    }

    function outputAction(name, params) {
        let content = actionTemplate.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]);
        output('lib/actions/' + name + '.js', content);
    }
    // function outputTrigger(name, params) {
    //     let content = triggerTemplate.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]);
    //     output('lib/actions/' + name + '.js', content);
    // }


    function quote(str) {
        return str && '\'' + str.replace(/[\\"']/g, '\\$&') + '\'';
    }

    function copyTemplate(src, dest = '') {
        //console.log('Writing file %s...', dest);
        waitFor.push(fse.copy(path.join(__dirname, '..', 'templates', src), path.join(outputDir, dest)));
    }
};

function addCredentials(comp, api) {
    comp.credentials = {
        fields: {}
    };

    let urls = api.servers ? api.servers.map(s => s.url + (s.description ? ' - ' + s.description : '')) : [];
    urls.push('--- Custom URL');

    comp.credentials.fields.server = {
        label: 'Server',
        viewClass: 'SelectView',
        model: urls,
        required: true
    };

    comp.credentials.fields.otherServer = {
        label: 'Custom Server URL',
        viewClass: 'TextFieldView'
    };


    let schemes = api.components && api.components.securitySchemes;
    let flows = [];
    _.forOwn(schemes, (scheme, key) => {
        if(scheme.type === 'oauth2') {
            _.forOwn(scheme.flows, (flow, flowType) => {
                if(flowType !== 'authorizationCode') {
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

    if(flows.length) {
        comp.envVars = {
            OAUTH_CLIENT_ID: {
                description: 'OAuth Client ID'
            },
            OAUTH_CLIENT_SECRET: {
                description: 'OAuth Client Secret'
            }
        };

        if(flows.length === 1) {
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
        }
        else {
            comp.credentials.fields.OAUTH_AUTHORIZATION_URL = {
                label: 'OAuth Authorization Code URL',
                viewClass: 'SelectView',
                model: _.fromPairs(flows.filter(flow => flow.authorizationUrl).map(flow => [
                    escapeUrlDots(flow.authorizationUrl),
                    flow.authorizationUrl + '(' + [flow.key, flow.description].join(' - ') + ')',
                ])),
            };
            comp.credentials.fields.OAUTH_TOKEN_URL = {
                label: 'OAuth Token URL',
                viewClass: 'SelectView',
                model: _.fromPairs(flows.filter(flow => flow.tokenUrl).map(flow => [
                    escapeUrlDots(flow.tokenUrl),
                    flow.tokenUrl + '(' + [flow.key, flow.description].join(' - ') + ')',
                ]))
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

    //console.log('spec', json(api));
    _.forOwn(schemes, (scheme, key) => {
        let fieldName = 'auth_' + key;
        if (scheme.type === 'apiKey') {
            comp.credentials.fields[fieldName] = {
                label: scheme.name + ' (' + key + ')',
                viewClass: 'TextFieldView',
                note: scheme.description
            }
        }
        else if (scheme.type === 'http' && scheme.scheme === 'basic') {
            comp.credentials.fields.auth_username = {
                label: 'Username (' + key + ')',
                viewClass: 'TextFieldView',
                note: scheme.description
            };
            comp.credentials.fields.auth_password = {
                label: 'Password (' + key + ')',
                viewClass: 'TextFieldView',
                note: scheme.description
            };
        }
        else if (scheme.type === 'http' && scheme.scheme === 'bearer') {
            comp.credentials.fields[fieldName] = {
                label: key + ' (' + scheme.bearerFormat + ')',
                viewClass: 'TextFieldView',
                note: scheme.description
            }
        }
        else if (scheme.type === 'oauth2') {
            //console.log('flows', json(scheme));
        }
        else if (scheme.type === 'openIdConnect') {
            comp.credentials.fields[key] = {
                label: key + ' (openIdConnect)',
                viewClass: 'TextFieldView',
                note: scheme.description
            }
        }
    });
}

function json(obj) {
    return JSON.stringify(obj, null, 4);
}

// map schema field names to sane ones (without special chars, except of underscore)
function mapSchemaFieldNames(schema, map) {
    if(!schema || !schema.properties) {
        return;
    }
    _.forOwn(schema.properties, (val, key, props) => {
        mapSchemaFieldNames(val, map);
        let goodKey = key.replace(/[^a-z0-9_]/ig, '_');
        if(key !== goodKey) {
            // prevent name clashes
            while(map[goodKey] && map[goodKey] !== key) {
                goodKey += '_';
            }

            // rename key
            props[goodKey] = val;
            delete props[key];
        }
        map[goodKey] = key;
    });
}

// traverses object recursively and transliterates (converts to us-ascii) any text value found.
// oih does not support utf8. https://support.elastic.io/support/tickets/2895
function transliterateObject(object) {
    traverseObject(object, (val, key, obj) => {
        if(typeof val === 'string') {
            obj[key] = transliterate(val);
        }
    });
}

/**
* @callback processCallback
* @param {any} value - the current property's value
* @param {string} key - the current property's name
* @param {object} object - the current "node"
*/

/**
 * Traverses an object recursively and calls a function for each "node"
 * @param {object} object - The object to traverse
 * @param {processCallback} processFn - The function to call on each "node"
 */
function traverseObject(object, processFn) {
    if(!object || typeof object !== 'object') {
        return;
    }
    _.forOwn(object, (val, key) => {
        processFn(val, key, object);
        traverseObject(val, processFn);
    });
}

function escapeUrlDots(url) {
    return url.replace(/\./g, '%2E');
}

function containsHtml(text) {
    if(!text) { return false; }
    text = text.trim();
    return text[0] === '<' && text.slice(-1)[0] === '>';
}

function toText(text) {
    if(containsHtml(text)) {
        text = htmlToText.fromString(text);
    }
    return text;
}

function toMD(text, options={}) {
    text = (text || '').trim();
    if(containsHtml(text)) {
        if(options.quote) {
            text = '<blockquote>' + text + '</blockquote>';
        }
        if(options.minHeaderLevel) {
            let headerBump = options.minHeaderLevel - Math.min(...(text.match(/<h[0-9]\b/g) || []).map(h => Number(h.slice(2))));
            text = text.replace(/(<\/?h)([0-9])\b/g, (m, p1, p2) => p1 + (Number(p2) + headerBump));
        }
    }
    else {
        text = text.replace(/$/mg, '<br/>');
        if(options.quote) {
            text = text.replace(/^/mg, '> ');
        }
    }
    return text;
}