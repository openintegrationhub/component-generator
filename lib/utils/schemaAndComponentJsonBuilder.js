const _ = require('lodash');
const { getSchemaOut } = require('./recursiveSearch');
const { filename, toText, quote } = require('./functions');
const { output } = require('./outputs');
const { lookup } = require('../scripts');
const mediaTypeParser = require('media-type');

async function schemaBuilder(api, componentJson, existingNames) {
  try {
    componentJson.triggers['lookup'] = lookup;

    _.forOwn(api.paths, (operations, opPath) => {
      if (opPath[0] !== '/') {
        return;
      } // skip x-* fields
      let pathParams = operations.parameters || {};

      _.forOwn(operations, async (operation, method) => {
        if (method === 'parameters') {
          return;
        }
        let name = operation.operationId || method + opPath;
        name = name.replace(/[^a-z0-9_]/gi, '_');
        if (!name.match(/^[a-z]/i)) {
          name = 'action_' + name;
        }
        if (existingNames[name]) {
          name = name + '_' + existingNames[name]++;
        }
        existingNames[name] = 1;

        let nameForFile = name.slice(0, 100);
        let schemaInFile = filename('lib/schemas', nameForFile + '.in.json');
        let schemaOutFile = filename('lib/schemas', nameForFile + '.out.json');
        let action = {
          main: filename('lib/actions', nameForFile + '.js'),
          title: toText(
            operation.summary ||
              operation.operationId ||
              operation.description ||
              name
          ),
          description: toText(operation.description),
          fields: {
            verbose: {
              viewClass: 'CheckBoxView',
              label: 'Debug this step (log more data)',
            },
          },
          callParams: {
            pathName: opPath,
            method: method,
          },
          metadata: {
            in: schemaInFile,
            out: schemaOutFile, //schemaOutFile,
          },
          $$$params: [],
          $$$tags: operation.tags,
          $$$title: _.trim(
            operation.summary ||
              operation.operationId ||
              operation.description ||
              name
          ),
          $$$description: _.trim(operation.description),
        };

        let schema = {
          type: 'object',
          properties: {},
        };
        _.each(Object.assign({}, pathParams, operation.parameters), (param) => {
          schema.properties[param.name] = Object.assign(
            {
              required: param.required,
            },
            param.schema
          );
          action.$$$params.push(param);
        });

        // ACTION.CONTENT_TYPE = 'undefined';

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
            // ACTION.CONTENT_TYPE = 'cfg.body_content_type';
            action.fields.body_content_type = {
              viewClass: 'SelectView',
              label: 'Body Content-Type',
              required: true,
              prompt: 'Choose a body Content-Type.',
              model: _.zipObject(
                contentTypes.map((ct) => ct.replace(/\./g, '%2E')),
                contentTypes
              ),
            };
          } else if (contentTypes.length === 1) {
            // ACTION.CONTENT_TYPE = `'${contentTypes[0]}'`;
            action.callParams['requestContentType'] = `${contentTypes[0]}`;
          }
        }

        let schemaOut = {};

        schemaOut = getSchemaOut(operation);
        await output(schemaInFile, schema);
        await output(schemaOutFile, schemaOut);

        const actionPath = quote(opPath);

        if (quote(method) === "'get'" && actionPath.slice(-2, -1) !== '}') {
          action.main = filename('lib/triggers/trigger.js');
          componentJson.triggers[name] = action;
        } else {
          action.main = filename('lib/actions/action.js');
          componentJson.actions[name] = action;
        }
      });
    });
  } catch (err) {
    console.log('\x1b[31m', 'error', err + '\033[91m');
  }
}

module.exports = {
  schemaBuilder,
};
