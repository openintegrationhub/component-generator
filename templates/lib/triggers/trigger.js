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
const { dataAndSnapshot, getMetadata, getElementDataFromResponse } = require("../utils/helpers");
const { createPaginator } = require("../utils/paginator");
const componentJson = require("../../component.json");

async function processTrigger(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
  const { snapshotKey, arraySplittingKey, syncParam, skipSnapshot, logLevel } = cfg.nodeSettings;

  this.loggger.info("Current log level: %s", this.logger.level());
  if (["fatal", "error", "warn", "info", "debug", "trace"].includes(logLevel)) {
    this.logger.level(logLevel);
    this.loggger.info("New log level: %s", this.logger.level());
  }

  this.logger.debug("Incoming message: %j", msg);
  this.logger.trace("Incoming configuration: %j", cfg);
  this.logger.debug("Incoming message headers: %j", incomingMessageHeaders);
  this.logger.debug("Incoming token data: %j", tokenData);

  const triggerFunction = tokenData["function"];
  this.logger.info('Starting to execute trigger "%s"', triggerFunction);

  this.logger.info("Incoming snapshot: %j", snapshot);

  this.logger.info(
    'Trigger settings - "snapshotKey": %s, "arraySplittingKey": %s, "syncParam": %s, "skipSnapshot": %s',
    snapshotKey,
    arraySplittingKey,
    syncParam,
    skipSnapshot
  );

  const trigger = componentJson.triggers[triggerFunction];
  const { pathName, method, requestContentType } = trigger.callParams;
  this.logger.info(
    'Found spec callParams: "pathName": %s, "method": %s, "requestContentType": %s',
    pathName,
    method,
    requestContentType
  );

  const specPath = spec.paths[pathName];
  const specPathParameters = specPath[method].parameters ? specPath[method].parameters.map(({ name }) => name) : [];

  let triggerParams = cfg.triggerParams;
  if (!triggerParams) {
    this.logger.debug("Trigger params was not found in cfg.triggerParams, going to look into cfg");
    triggerParams = cfg;
  } else {
    this.logger.info("Found incoming trigger params: %j", triggerParams);
  }

  let parameters = {};
  for (let param of specPathParameters) {
    parameters[param] = triggerParams[param];
  }

  if (syncParam && snapshot.lastUpdated) {
    parameters[syncParam] = snapshot.lastUpdated;
  }
  this.logger.debug("Parameters were populated from configuration: %j", parameters);

  $SECURITIES;

  if (cfg.otherServer) {
    if (!spec.servers) {
      spec.servers = [];
    }
    spec.servers.push({ url: cfg.otherServer });
    this.logger.debug("Server: %s was added to spec servers array", cfg.otherServer);
  }

  const paginationConfig = $PAGINATION_CONFIG;

  // if there is user provided pageSize
  if (paginationConfig?.pageSizeOption?.fieldName) {
    // if user specified pageSize - we take that
    if (parameters[paginationConfig.pageSizeOption.fieldName]) {
      paginationConfig.strategy.pageSize = parseInt(parameters[paginationConfig.pageSizeOption.fieldName]);
    }
    // otherwise we use a configured pageSize
    else {
      parameters[paginationConfig.pageSizeOption.fieldName] = paginationConfig.strategy.pageSize;
    }
  }

  this.logger.info("Pagination config %j", paginationConfig);

  let callParams = {
    spec: spec,
    operationId: triggerFunction,
    pathName: pathName,
    method: method,
    parameters: parameters,
    requestContentType: requestContentType,
    securities: { authorized: securities },
    server: spec.servers[cfg.server] || cfg.otherServer,
  };

  const paginator = createPaginator(paginationConfig);

  let hasMorePages = true;
  do {
    const callParamsForLogging = { ...callParams };
    callParamsForLogging.spec = "[omitted]";
    this.logger.trace('Call parameters with "securities": %j', callParamsForLogging);
    callParamsForLogging.securities = "[omitted]";
    this.logger.info("Final Call params: %j", callParamsForLogging);

    const resp = await Swagger.execute(callParams);
    const { url, body, headers } = resp;
    this.logger.debug("Swagger response: %j", { url, body, headers });

    const newElement = {};
    newElement.metadata = getMetadata(msg.metadata);

    newElement.data = getElementDataFromResponse.call(this, arraySplittingKey, body);
    if (skipSnapshot) {
      this.logger.info("Option skipSnapshot enabled, just going to return found data, pagination is disabled");
      return newElement.data; //no pagination if skipping snapshot
    } else {
      await dataAndSnapshot.call(this, newElement, snapshot, snapshotKey, "", this);
    }

    // pagination
    if (paginator.hasNextPage({ body, headers })) {
      callParams = { ...callParams, parameters: { ...callParams.parameters } };
      callParams.parameters[paginationConfig.pageTokenOption.fieldName] = paginator.getNextPageToken({ body, headers });
      this.logger.info("Found the next page, going to request...");
      hasMorePages = true;
    } else {
      this.logger.info("All pages have been received");
      hasMorePages = false;
    }
  } while (hasMorePages);
  this.logger.info("Execution finished");
}

module.exports = { process: processTrigger };
