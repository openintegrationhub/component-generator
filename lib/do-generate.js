const fse = require("fs-extra");
const path = require("path");
const download = require("./download");
const validate = require("./validate");
const generate = require("./generate");

module.exports = async function doGenerate({ swaggerUrl, outputDir, connectorName, snapshot }) {
  const downloadedSpecFile = path.join(outputDir, "openapi-original.json");
  const validatedSpecFile = path.join(outputDir, "openapi-validated.json");
  const generatePath = path.join(outputDir, connectorName);

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
  });

  console.log("\x1b[32m", "Successfully generated. Connector has been saved in output directory:", generatePath);

  // cleanup
  fse.remove(downloadedSpecFile).catch((err) => console.error("Could not remove original API specification", err));
  fse.remove(validatedSpecFile).catch((err) => console.error("Could not remove validated API specification", err));

  return result;
};
