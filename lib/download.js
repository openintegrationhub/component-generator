/**
 * : OIH-openapi-component-generator
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const SwaggerParser = require("swagger-parser");
const fse = require("fs-extra");

const httpResolver = require("./http-resolver");

/**
 * Downloads a swagger definition (json or yaml) and saves it to a local json file.
 * @param {object} opts - named arguments
 * @param {string} opts.swaggerUrl - url to download the swagger definition from, or path to local file
 * @param {string} opts.outputFile - file name to save the swagger definition to (in json format)
 * @returns {Promise} - resolves when the swagger definition is saved to the local file
 */
module.exports = function download({ swaggerUrl, outputFile }) {
  return SwaggerParser.bundle(swaggerUrl, { resolve: { http: httpResolver } }).then((spec) => {
    if (!spec) {
      throw new Error("Empty swagger specification, url=" + swaggerUrl);
    }
    return fse.outputFile(outputFile, JSON.stringify(spec, null, 4));
  });
};
