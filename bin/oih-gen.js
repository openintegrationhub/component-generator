#!/usr/bin/env node

/**
 * OIH-openapi-component-generator
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const doGenerate = require("../lib/do-generate");
const { program } = require("commander");
const { version } = require("../package.json");

/**
 * CLI utility for generating a single connector
 * @returns {Promise<void>}
 */
async function oihGen() {
  program
    .version(version)
    .argument("<url or file>", "Url or file with OpenAPI definition")
    .requiredOption(
      "-o, --output <directory>",
      "Output directory where a directory with a generated component will be created"
    )
    .requiredOption("-n, --name <name>", "Component's name")
    .option("-s, --snapshot [string]", "Field name to be used for snapshot in triggers", "")
    .parse();

  const options = program.opts();

  const url = program.args[0];
  if (!url) {
    throw new Error(
      "Missing required parameter. Please provide an url to download the OpenAPI definition from or a path to a local file."
    );
  }

  await doGenerate({
    swaggerUrl: url,
    connectorName: options.name,
    outputDir: options.output,
    snapshot: options.snapshot,
  });
}

oihGen().catch((e) => {
  console.error("An error occurred.", e.message);
  process.exit(1);
});

module.exports = oihGen;
