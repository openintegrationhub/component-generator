/**
 * : OIH-openapi-component-generator
 * Copyright © 2020,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const SwaggerParser = require("swagger-parser");
const fse = require("fs-extra");
const path = require("path");
const { outputs } = require("./utils/outputs");
const { getComponentJson } = require("./utils/functions");
const { schemaBuilder } = require("./utils/schemaAndComponentJsonBuilder");

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
module.exports = async function generate({
  inputFile,
  outputDir,
  packageName,
  swaggerUrl,
  snapshot,
  paginationConfig,
  suffixServiceNameToTitle = false,
}) {
  let api = await SwaggerParser.parse(inputFile);
  if (!api.components) {
    api.components = {};
    api.components.securitySchemes = {};
    api.security = [];
  }
  let apiTitle = api.info.title + (suffixServiceNameToTitle ? " (" + api.info["x-serviceName"] + ")" : "");

  if (!swaggerUrl || !swaggerUrl.match(/^https?:\/\//)) {
    swaggerUrl = api.servers[0].url;
  }

  // removing lib dir only, the rest of the files will be just overwritten
  const libDir = path.join(outputDir, "lib");
  if (fse.existsSync(libDir)) {
    fse.removeSync(libDir);
  }

  let componentJson = await getComponentJson(apiTitle, api, swaggerUrl, this);
  let existingNames = {};

  // generate actions
  await schemaBuilder(api, componentJson, existingNames, outputDir);

  await outputs(packageName, api, swaggerUrl, componentJson, outputDir, apiTitle, snapshot, paginationConfig);

  return {
    componentJson,
  };
};
