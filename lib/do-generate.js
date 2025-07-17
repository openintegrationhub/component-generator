const fse = require("fs-extra");
const path = require("path");
const download = require("./download");
const validate = require("./validate");
const generate = require("./generate");

/**
 * @param {string} swaggerUrl
 * @param {string} outputDir
 * @param {string} connectorName
 * @param {string} snapshot
 * @param {object} paginationConfig
 * @param {object} paginationConfig.strategy
 * @param {string} paginationConfig.strategy.type
 * @param {string} paginationConfig.strategy.in
 * @param {string} paginationConfig.strategy.nextCursorPath
 * @param {object} paginationConfig.pageTokenOption
 * @param {string} paginationConfig.pageTokenOption.fieldName
 * @param {number} rateLimit
 * @param {string} syncParamFormat
 * @returns {Promise<*>}
 */
module.exports = async function doGenerate({ swaggerUrl, outputDir, connectorName, snapshot, paginationConfig, rateLimit, syncParamFormat }) {
  const downloadedSpecFile = path.join(outputDir, "openapi-original.json");
  const validatedSpecFile = path.join(outputDir, "openapi-validated.json");
  const generatePath = path.join(outputDir, connectorName);

  console.log("Pagination config", paginationConfig);

  console.log("Downloading...");
  await download({
    swaggerUrl: swaggerUrl,
    outputFile: downloadedSpecFile,
  });

  console.log("Validating...");
  await validate({
    inputFile: downloadedSpecFile,
    outputFile: validatedSpecFile,
    swaggerUrl: swaggerUrl,
  });

  console.log("Generating...");
  const result = await generate({
    inputFile: validatedSpecFile,
    outputDir: generatePath,
    packageName: connectorName,
    swaggerUrl: swaggerUrl,
    snapshot: snapshot || "",
    paginationConfig,
    rateLimit: rateLimit || -1,
    syncParamFormat: syncParamFormat
  });

  console.log("\x1b[32m", "Successfully generated. Connector has been saved in output directory:", generatePath);

  // cleanup
  fse.remove(downloadedSpecFile).catch((err) => console.error("Could not remove original API specification", err));
  fse.remove(validatedSpecFile).catch((err) => console.error("Could not remove validated API specification", err));

  return result;
};
