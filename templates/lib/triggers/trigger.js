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
const { dataAndSnapshot, getMetadata, getElementDataFromResponse, executeCall, getInitialSnapshotValue } = require("../utils/helpers");
const { createPaginator } = require("../utils/paginator");
const componentJson = require("../../component.json");

async function processTrigger(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
  let logger = this.logger;
  let continueOnError = false;
  if (cfg && cfg.nodeSettings && cfg.nodeSettings.continueOnError) continueOnError = true;

  try {
    const { snapshotKey, arraySplittingKey, syncParam, skipSnapshot, logLevel } = cfg.nodeSettings;

    if (["fatal", "error", "warn", "info", "debug", "trace"].includes(logLevel)) {
      logger = this.logger.child({});
      logger.level && logger.level(logLevel);
    }

    logger.debug("Incoming message: %j", msg);
    logger.trace("Incoming configuration: %j", cfg);
    logger.debug("Incoming message headers: %j", incomingMessageHeaders);
    logger.debug("Incoming token data: %j", tokenData);

    const triggerFunction = tokenData["function"];
    logger.info('Starting to execute trigger "%s"', triggerFunction);

    logger.info("Incoming snapshot: %j", snapshot);

    snapshot.lastUpdated = getInitialSnapshotValue(cfg, snapshot);

    logger.info("Using snapshot: %j", snapshot);

    logger.info(
      'Trigger settings - "snapshotKey": %s, "arraySplittingKey": %s, "syncParam": %s, "skipSnapshot": %s',
      snapshotKey,
      arraySplittingKey,
      syncParam,
      skipSnapshot
    );

    const trigger = componentJson.triggers[triggerFunction];
    const { operationId, pathName, method, requestContentType } = trigger.callParams;
    logger.info(
      'Found spec callParams: "pathName": %s, "method": %s, "requestContentType": %s',
      pathName,
      method,
      requestContentType
    );

    const specPath = spec.paths[pathName];
    const specPathGeneralParams = specPath.parameters? specPath.parameters.map(({ name }) => name) : [];
    const specPathParameters = specPath[method].parameters ? specPath[method].parameters.map(({ name }) => name) : [];
    specPathParameters.push(...specPathGeneralParams);

    let triggerParams = cfg.triggerParams;
    if (!triggerParams) {
      logger.debug("Trigger params was not found in cfg.triggerParams, going to look into cfg");
      triggerParams = cfg;
    } else {
      logger.info("Found incoming trigger params: %j", triggerParams);
    }

    let parameters = {};
    for (let param of specPathParameters) {
      if (triggerParams[param]) {
        parameters[param] = triggerParams[param];
      }
    }

    if (syncParam && snapshot.lastUpdated) {
      if (syncParam === "$FILTER") {
        if (!snapshotKey) {
          throw new Error("snapshotKey params should be specified!");
        }
        parameters[syncParam] = `${snapshotKey} gt datetime'${snapshot.lastUpdated}'`;
      } else {
        parameters[syncParam] = snapshot.lastUpdated;
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

    logger.info("Pagination config %j", paginationConfig);

    let callParams = {
      spec: spec,
      operationId: operationId,
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
      const { body, headers } = await executeCall.call(this, callParams);

      const newElement = {};
      newElement.metadata = getMetadata(msg.metadata);
      newElement.data = getElementDataFromResponse.call(this, arraySplittingKey, body);
      if (skipSnapshot) {
        logger.info("Option skipSnapshot enabled, just going to return found data, pagination is disabled");
        return newElement.data; //no pagination if skipping snapshot
      } else {
        await dataAndSnapshot.call(this, newElement, snapshot, snapshotKey, "", this);
      }

      // pagination
      if (paginator.hasNextPage({ body, headers })) {
        callParams = { ...callParams, parameters: { ...callParams.parameters } };
        callParams.parameters[paginationConfig.pageTokenOption.fieldName] = paginator.getNextPageToken({ body, headers });
        logger.info("Found the next page, going to request...");
        hasMorePages = true;
      } else {
        logger.info("All pages have been received");
        hasMorePages = false;
      }
    } while (hasMorePages);
    logger.info("Execution finished");
  } catch (e) {
    if (continueOnError === true) {
      this.emit('data', { data: {} });
    } else {
      this.emit('error', e);
    }
    logger.error(e);
  }
}

module.exports = { process: processTrigger };
