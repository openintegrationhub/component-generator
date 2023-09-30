/**
 * Auto-generated trigger file for "$API_TITLE" API.
 * Generated at: $NOW
 * Mass generator version: $GENERATOR_VERSION
 *
 * : $PACKAGE_NAME
 * Copyright © 2023,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 *
 */

const Swagger = require("swagger-client");
const spec = require("../spec.json");
const { mapFieldNames, getMetadata, mapFormDataBody } = require("../utils/helpers");
const componentJson = require("../../component.json");

async function processAction(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
  let logger = this.logger;
  const { logLevel } = cfg.nodeSettings;

  if (["fatal", "error", "warn", "info", "debug", "trace"].includes(logLevel)) {
    logger = this.logger.child({});
    logger.level && logger.level(logLevel);
  }

  logger.debug("Incoming message: %j", msg);
  logger.trace("Incoming configuration: %j", cfg);
  logger.debug("Incoming snapshot: %j", snapshot);
  logger.debug("Incoming message headers: %j", incomingMessageHeaders);
  logger.debug("Incoming token data: %j", tokenData);

  const actionFunction = tokenData["function"];
  logger.info("Starting to execute action '%s'", actionFunction);

  const action = componentJson.actions[actionFunction];
  const { pathName, method, requestContentType } = action.callParams;
  logger.info(
    "Found spec callParams: 'pathName': %s, 'method': %s, 'requestContentType': %s",
    pathName,
    method,
    requestContentType
  );

  const specPath = spec.paths[pathName];
  const specPathParameters = specPath[method].parameters ? specPath[method].parameters.map(({ name }) => name) : [];

  let body = msg.data;
  mapFieldNames(body);
  if (requestContentType === "multipart/form-data") {
    logger.info("requestContentType multipart/form-data is defined");
    body = await mapFormDataBody.call(this, action, body);
  }

  let parameters = {};
  for (let param of specPathParameters) {
    parameters[param] = body[param];
  }
  logger.debug("Parameters were populated from configuration: %j", parameters);

  $SECURITIES;

  if (cfg.otherServer) {
    if (!spec.servers) {
      spec.servers = [];
    }
    spec.servers.push({ url: cfg.otherServer });
    logger.debug("Server: %s was added to spec servers array", cfg.otherServer);
  }

  const callParams = {
    spec: spec,
    operationId: actionFunction,
    pathName: pathName,
    method: method,
    parameters: parameters,
    requestContentType: requestContentType,
    requestBody: body,
    securities: { authorized: securities },
    server: spec.servers[cfg.server] || cfg.otherServer,
  };
  if (callParams.method === "get") {
    delete callParams.requestBody;
  }

  const callParamsForLogging = { ...callParams };
  callParamsForLogging.spec = "[omitted]";
  logger.trace("Call parameters with 'securities': %j", callParamsForLogging);
  callParamsForLogging.securities = "[omitted]";
  logger.info("Final Call params: %j", callParamsForLogging);

  // Call operation via Swagger client
  return Swagger.execute(callParams).then((resp) => {
    const { url, body, headers } = resp;
    logger.debug("Swagger response %j", { url, body, headers });
    const newElement = {};
    newElement.metadata = getMetadata(msg.metadata);
    newElement.data = resp.data;
    logger.info("Going to emit response data...");
    this.emit("data", newElement);
    logger.info("Execution finished");
  });
}

module.exports = { process: processAction };
