const _ = require("lodash");
const { getSchemaOut } = require("./recursiveSearch");
const { filename, toText, output } = require("./functions");
const { lookup } = require("../scripts");
const mediaTypeParser = require("media-type");

async function schemaBuilder(api, componentJson, existingNames, outputDir) {
  try {
    componentJson.triggers["lookup"] = lookup;

    _.forOwn(api.paths, (operations, opPath) => {
      if (opPath[0] !== "/") {
        return;
      } // skip x-* fields
      let pathParams = operations.parameters || {};
      let requiredGeneralParams;
      if (operations.parameters) {
        requiredGeneralParams = operations.parameters.filter((param) => param.required);
      }

      _.forOwn(operations, async (operation, method) => {
        if (method === "parameters" || !(operation instanceof Object)) {
          return;
        }

        // In cases where we need a triggers also as an action
        let makeAction = false;
        if (method.includes('get') && operation.summary.includes('#MAKEACTION#')) {
          operation.summary = operation.summary.replace('#MAKEACTION#', '');
          makeAction = true;
        }

        let name = operation.operationId || method + opPath;
        name = name.replace(/[^a-z0-9_]/gi, "_");
        if (!name.match(/^[a-z]/i)) {
          name = "action_" + name;
        }
        if (existingNames[name]) {
          name = name + "_" + existingNames[name]++;
        }
        existingNames[name] = 1;

        let nameForFile = name.slice(0, 100);
        let schemaInFile = filename("lib/schemas", nameForFile + ".in.json");
        let schemaOutFile = filename("lib/schemas", nameForFile + ".out.json");
        let action = {
          main: filename("lib/actions", nameForFile + ".js"),
          title: toText(operation.summary || operation.operationId || operation.description || name),
          description: toText(operation.description),
          callParams: {
            operationId: operation.operationId,
            pathName: opPath,
            method: method,
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

        let schema = {
          type: "object",
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

        if (requiredGeneralParams) {
          requiredGeneralParams.forEach((param) => {
            schema.properties[param.name] = Object.assign(
              {
                required: param.required,
              },
              param.schema
            );
            action.$$$params.push(param);
          });
        }

        if (operation.requestBody) {
          let contentTypes = [];

          _.forOwn(operation.requestBody.content, (content, contentType) => {
            if (!schema.properties.requestBody) {
              schema.properties.requestBody = content.schema;
            }

            contentTypes.push(contentType);
            let type = mediaTypeParser.fromString(contentType);
            if (type.subtype === "json" || type.suffix === "json") {
              schema.properties.requestBody = content.schema;
            }
          });

          let rb = schema.properties.requestBody;
          if (rb && rb.properties && !rb.type) {
            rb.type = "object"; // missing in some, eg. adyen-com-fund-service
          }

          if (contentTypes.length > 1) {
            action.callParams["requestContentType"] = contentTypes.some((c) => c === "application/json")
              ? "application/json"
              : `${contentTypes[0]}`;
          } else if (contentTypes.length === 1) {
            action.callParams["requestContentType"] = `${contentTypes[0]}`;
          }
        }

        let schemaOut = {};

        schemaOut = getSchemaOut(operation);
        await output(schemaInFile, schema, undefined, outputDir);
        await output(schemaOutFile, schemaOut, undefined, outputDir);

        if (method === "get" && !opPath.includes("{")) {
          action.main = filename("lib/triggers/trigger.js");
          componentJson.triggers[name] = action;
        } else {
          action.main = filename("lib/actions/action.js");
          componentJson.actions[name] = action;
        }

        // triggers that were marked with makeaction are also actions
        if (makeAction) {
          const newAction = _.cloneDeep(action);
          newAction.main = filename("lib/actions/action.js");
          componentJson.actions[`${name}_action`] = newAction;
        }

        // get requests with path params are also triggers
        // we need to add a postfix to the trigger name, so that we don't break old components
        if (method === "get" && opPath.includes("{")) {
          const trigger = _.cloneDeep(action);
          trigger.main = filename("lib/triggers/trigger.js");
          componentJson.triggers[`${name}_trigger`] = trigger;
        }
      });
    });
  } catch (err) {
    console.log("\x1b[31m", "error", err + "\033[91m");
  }
}

module.exports = {
  schemaBuilder,
};
