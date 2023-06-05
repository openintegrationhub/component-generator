#!/usr/bin/env node

/**
 * OIH-openapi-component-generator
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const doGenerate = require("../lib/do-generate");
const { program, Option } = require("commander");
const { version } = require("../package.json");

/**
 * CLI utility for generating a single connector
 * @returns {Promise<void>}
 */
async function oihGen() {
  program
    .version(version)
    .argument("<url or file>", "Url or file with OpenAPI definition")
    .requiredOption("-o, --output <directory>", "Output directory where a generated component will be created")
    .requiredOption("-n, --name <name>", "Component's name")
    .option("-s, --snapshot [string]", "Field name to be used for snapshot in triggers", "")
    .addOption(
      new Option("--pagination-type [type]", "Type of pagination")
        .choices(["no_pagination", "cursor"])
        .default("no_pagination")
    )
    .option("--pagination-next-cursor-path [path]", "Path to the next pagination cursor")
    .option("--pagination-results-path [path]", "Path to the results array in body")
    .addOption(
      new Option("--pagination-token-in [path]", "Where to look for the next page token")
        .choices(["body", "headers"])
        .default("body")
    )
    .option("--pagination-page-size [number]", "Number of results per page to fetch")
    .option("--pagination-token-field-name [name]", "Name of the field in an API accepting the pagination token")
    .option("--pagination-page-size-field-name [name]", "Name of the field in an API accepting the page size option")
    .parse();

  const options = program.opts();

  // console.log(options);

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
    paginationConfig: {
      pageTokenOption: {
        fieldName: options.paginationTokenFieldName,
      },
      pageSizeOption: {
        fieldName: options.paginationPageSizeFieldName,
      },
      strategy: {
        type: options.paginationType,
        pageSize: options.paginationPageSize,
        tokenIn: options.paginationTokenIn,
        nextCursorPath: options.paginationNextCursorPath,
        resultsPath: options.paginationResultsPath,
      },
    },
  });
}

oihGen().catch((e) => {
  console.error("An error occurred.", e.message);
  process.exit(1);
});

module.exports = oihGen;
