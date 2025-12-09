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
const {
  mapFieldNames,
  getMetadata,
  mapFormDataBody,
  putAdditionalParamsInBody,
  executeCall,
  formatApiKey,
} = require("../utils/helpers");
const componentJson = require("../../component.json");

async function processAction(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
  let logger = this.logger;
  const { logLevel } = cfg.nodeSettings;

  let continueOnError = false;
  if (cfg && cfg.nodeSettings && cfg.nodeSettings.continueOnError) continueOnError = true;

  let returnResult = false;
  if (cfg && cfg.returnResult) returnResult = true;

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

    if (cfg?.key && componentJson?.authFormat) {
      cfg.key = formatApiKey(cfg.key, componentJson.authFormat);
    }

    const actionFunction = tokenData["function"];
    logger.info("Starting to execute action '%s'", actionFunction);

    const action = componentJson.actions[actionFunction];
    const { operationId, pathName, method, requestContentType, responseContentType } = action.callParams;
    logger.info(
      "Found spec callParams: 'pathName': %s, 'method': %s, 'requestContentType': %s, 'responseContentType': %t",
      pathName,
      method,
      requestContentType,
      responseContentType
    );

    const specPath = spec.paths[pathName];
    const specPathGeneralParams = specPath.parameters ? specPath.parameters.map(({ name }) => name) : [];
    const specPathParameters = specPath[method].parameters ? specPath[method].parameters.map(({ name }) => name) : [];
    specPathParameters.push(...specPathGeneralParams);

    let body = msg.data;

    if (cfg.nodeSettings && cfg.nodeSettings.injectFlowData) {
      if (!cfg.additionalParameters) cfg.additionalParameters = {};
      const logChild = this.logger.child();
      if (logChild && logChild.fields && logChild.fields.flowId) {
        cfg.additionalParameters.flowID = logChild.fields.flowId;
      }
    }

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
      responseContentType: responseContentType,
      requestBody: body,
      securities: { authorized: securities },
      server: spec.servers[cfg.server] || cfg.otherServer,
    };
    if (callParams.method === "get") {
      delete callParams.requestBody;
    }

    const resp = await executeCall.call(this, callParams);

    // Wait for rate limit if specified
    const rateLimit =
      cfg.nodeSettings && cfg.nodeSettings.rateLimit
        ? parseInt(cfg.nodeSettings.rateLimit)
        : Number.isInteger(componentJson.rateLimit)
          ? componentJson.rateLimit
          : 0;
    if (rateLimit > 0) {
      this.logger.info(`Waiting for rate limit: ${rateLimit} ms`);
      await new Promise((resolve) => setTimeout(resolve, rateLimit));
    }

    const responseBody = resp.body;
    const { arraySplittingKey } = cfg.nodeSettings;

    if (arraySplittingKey && !returnResult) {
      if (Array.isArray(responseBody)) {
        logger.info(`Response is an array with ${responseBody.length} items. Emitting each element separately.`);
        responseBody.forEach((item, index) => {
          this.emit("data", {
            data: item,
            metadata: getMetadata(msg.metadata),
          });
          logger.info(`Emitted array item at index ${index}`);
        });
      } else if (responseBody && typeof responseBody === "object") {
        logger.info(`Response is an object. Resolving nested path "${arraySplittingKey}".`);
        const splitArray = arraySplittingKey
          .split(".")
          .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), responseBody);

        if (Array.isArray(splitArray)) {
          logger.info(`Found array at "${arraySplittingKey}" with ${splitArray.length} items. Emitting each element.`);
          splitArray.forEach((item, index) => {
            this.emit("data", {
              data: item,
              metadata: getMetadata(msg.metadata),
            });
            logger.info(`Emitted nested array item at index ${index}`);
          });
        } else {
          if (splitArray === null) {
            logger.info(`Path "${arraySplittingKey}" not found in response object. Emitting full response instead.`);
          } else {
            logger.info(`Path "${arraySplittingKey}" resolved, but value is not an array (type: ${typeof splitArray}). Emitting full response instead.`);
          }
          this.emit("data", { data: responseBody, metadata: getMetadata(msg.metadata) });
        }
      } else {
        logger.info(`Array splitting key "${arraySplittingKey}" was specified, but response is neither an array nor an object. Type: ${typeof responseBody}. Emitting full response.`);
        this.emit("data", { data: responseBody, metadata: getMetadata(msg.metadata) });
      }
    } else {
      const outputMessage = {
        metadata: getMetadata(msg.metadata),
        data: responseBody,
      };

      if (returnResult) {
        logger.info(`returnResult flag is true. Returning output message instead of emitting.`);
        return outputMessage;
      }

      this.emit("data", outputMessage);
      this.logger.info("Execution finished: emitted single message.");
    }
  } catch (e) {
    if (continueOnError === true) {
      this.emit("data", { data: {}, metadata: {} });
    } else {
      this.emit("error", e);
    }
    logger.error(e);
    if (returnResult) {
      return { error: e }
    }
  }
}

module.exports = { process: processAction };
