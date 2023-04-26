/**
 * Auto-generated trigger file for "$API_TITLE" API.
 * Generated at: $NOW
 * Mass generator version: $GENERATOR_VERSION
 *
 * : $PACKAGE_NAME
 * Copyright © 2020,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 *
 */

const Swagger = require("swagger-client");
const spec = require("../spec.json");
const { dataAndSnapshot, mapFieldNames, getMetadata, getElementDataFromResponse } = require("../utils/helpers");
const componentJson = require("../../component.json");

function processTrigger(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
  const isVerbose = process.env.debug || cfg.verbose;

  this.logger.info("Incoming message %j", msg);
  this.logger.info("Config %j", cfg);
  this.logger.info("Snapshot %j", snapshot);
  this.logger.info("Message headers %j", incomingMessageHeaders);
  this.logger.info("Token data %j", tokenData);

  const { snapshotKey, arraySplittingKey, syncParam, skipSnapshot } = cfg.nodeSettings;
  const trigger = componentJson.triggers[tokenData["function"]];
  const { pathName, method, requestContentType } = trigger.callParams;

  const specPath = spec.paths[pathName];
  const specPathParameters = specPath[method].parameters
    ? specPath[method].parameters.map(({ name }) => name)
    : [];

  let parameters = {};
  for (let param of specPathParameters) {
    parameters[param] = cfg[param];
  }
  if (syncParam && snapshot.lastUpdated) {
    parameters[syncParam] = snapshot.lastUpdated;
  }

  $SECURITIES;

  if (cfg.otherServer) {
    if (!spec.servers) {
      spec.servers = [];
    }
    spec.servers.push({ url: cfg.otherServer });
  }

  const callParams = {
    spec: spec,
    operationId: tokenData["function"],
    pathName: pathName,
    method: method,
    parameters: parameters,
    requestContentType: requestContentType,
    securities: { authorized: securities },
    server: spec.servers[cfg.server] || cfg.otherServer,
  };

  const callParamsForLogging = { ...callParams };
  callParamsForLogging.spec = "[omitted]";
  this.logger.info("Call params %j", callParamsForLogging);


  // Call operation via Swagger client
  return Swagger.execute(callParams).then(async (resp) => {
    this.logger.info("Swagger response %j", resp);

    delete resp.uid;
    const newElement = {};
    newElement.metadata = getMetadata(msg.metadata);
    const response = JSON.parse(resp.data);

    newElement.data = getElementDataFromResponse(arraySplittingKey, response);
    if (skipSnapshot) {
      return newElement.data;
    } else {
      await dataAndSnapshot(newElement, snapshot, snapshotKey, $SNAPSHOT, this);
    }
  });
}

module.exports = { process: processTrigger };
