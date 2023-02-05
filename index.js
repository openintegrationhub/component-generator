/**
 * OIH openapi-component-generator
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

"use strict";

module.exports = {
  download: require("./lib/download.js"),
  validate: require("./lib/validate.js"),
  generate: require("./lib/generate.js"),
  doGenerate: require("./lib/do-generate.js"),
  oihGen: require("./bin/oih-gen"),
};
