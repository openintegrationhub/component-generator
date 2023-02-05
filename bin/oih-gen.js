#!/usr/bin/env node

/**
 * OIH-openapi-component-generator
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const getopts = require("getopts");
const doGenerate = require("../lib/do-generate");
const Questionnaire = require("../lib/questionnaire");

module.exports = oihGen;

oihGen().catch((e) => {
  console.error("An error occurred.", e.message);
  process.exit(1);
});

/**
 * CLI utility for generating a single connector
 * @returns {Promise<void>}
 */
async function oihGen() {
  const options = getopts(process.argv.slice(2), {
    alias: {
      output: "o",
      name: "n",
      help: "h",
      yes: "y",
      snapshot: "s",
    },
    string: ["o", "n", "s"],
  });

  if (options.help) {
    printHelp();
    return;
  }

  const skipQuestionnaire = options.yes;
  const q = new Questionnaire(skipQuestionnaire);

  const url = options._[0];
  if (!url) {
    printHelp();
    throw new Error(
      "Missing required parameter. Please provide an url to download the swagger definition from or a path to a local file."
    );
  }

  const outputDir = options.output || (await q.ask("Output directory", "output"));
  await doGenerate({ swaggerUrl: url, connectorName: options.name, outputDir, snapshot: options.snapshot });

  q.finish();
}

function printHelp() {
  console.log(`
        Usage: oih-gen [OPTIONS] {URL|FILE}
        Usage example: oih-gen -o petstore-connector -n petstore https://petstore.swagger.io/v2/swagger.json\n
        Generate a connector from an OpenAPI definition provided from an url or a local file.\n
        Options:
          -o, --output \t\t output directory where to store the downloaded and validated specification files and the generated connector
          -n, --name \t\t connector name used as package name in package.json file
          -y, --yes \t\t automatically populate all options with default values
          -h, --help \t\t display this help
    `);
}
