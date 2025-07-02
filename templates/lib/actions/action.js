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

const spec = require("../spec.json");
const { mapFieldNames, getMetadata, mapFormDataBody, putAdditionalParamsInBody, executeCall } = require("../utils/helpers");
const componentJson = require("../../component.json");

async function processAction(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
  let logger = this.logger;
  const { logLevel } = cfg.nodeSettings;

  let continueOnError = false;
  if (cfg && cfg.nodeSettings && cfg.nodeSettings.continueOnError) continueOnError = true;

  try {

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
    const { operationId, pathName, method, requestContentType } = action.callParams;
    logger.info(
      "Found spec callParams: 'pathName': %s, 'method': %s, 'requestContentType': %s",
      pathName,
      method,
      requestContentType
    );

    const specPath = spec.paths[pathName];
    const specPathGeneralParams = specPath.parameters ? specPath.parameters.map(({ name }) => name) : [];
    const specPathParameters = specPath[method].parameters ? specPath[method].parameters.map(({ name }) => name) : [];
    specPathParameters.push(...specPathGeneralParams);

    let body = msg.data;

    if (cfg && cfg.additionalParameters) {
      body = await putAdditionalParamsInBody.call(this, action, body, cfg.additionalParameters);
    }

    mapFieldNames(body);
    if (requestContentType === "multipart/form-data") {
      logger.info("requestContentType multipart/form-data is defined");
      body = await mapFormDataBody.call(this, action, body);
    }

    let parameters = {};
    for (let param of specPathParameters) {
      if (body[param]) {
        parameters[param] = body[param];
        delete body[param];
      } else if (cfg && cfg.additionalParameters && cfg.additionalParameters[param]) {
        parameters[param] = cfg.additionalParameters[param];
      }
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
      operationId: operationId,
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


    const resp = await executeCall.call(this, callParams);

    // Wait for rate limit if specified
    const rateLimit = cfg.nodeSettings && cfg.nodeSettings.rateLimit ? parseInt(cfg.nodeSettings.rateLimit) : 1700;
    if (rateLimit > 0) {
      this.logger.info(`Waiting for rate limit: ${rateLimit} ms`);
      await new Promise(resolve => setTimeout(resolve, rateLimit));
    }

    const newElement = {};
    newElement.metadata = getMetadata(msg.metadata);
    newElement.data = resp.body;

    if (cfg.returnResult) {
      return newElement;
    }

    this.emit("data", newElement);
    this.logger.info("Execution finished");
  } catch (e) {
    if (continueOnError === true) {
      this.emit('data', { data: {}, metadata: {} });
    } else {
      this.emit('error', e);
    }
    logger.error(e);
  }
}

module.exports = { process: processAction };
