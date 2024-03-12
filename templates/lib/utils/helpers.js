const dayjs = require("dayjs");
const lodashGet = require("lodash.get");
const fs = require("fs");
const FormDataNode = require("formdata-node");
const path = require("path");
const axios = require("axios");
const Swagger = require("swagger-client");
const retry = require("retry");
const { File } = FormDataNode;

const executeSwaggerCall = async function (callParams) {
  const operation = retry.operation({
    retries: 5,
    factor: 2,
    minTimeout: 5000,
    maxTimeout: 6000,
    randomize: true,
  });
  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        const response = await Swagger.execute(callParams);
        resolve(response);
      } catch (error) {
        if (
          operation.retry(error) &&
          error.status &&
          error.status > 400 &&
          error.status !== 401 &&
          error.status !== 403 &&
          error.status !== 409 &&
          error.status !== 422
        ) {
          this.logger.info(
            `Received response status: ${error.status}. Attempt #${currentAttempt}. Retrying in ${operation._originalTimeouts[currentAttempt - 1]
            } ms...`
          );
          return;
        }
        reject(operation.mainError());
      }
    });
  });
};

const executeCall = async function (callParams) {
  const callParamsForLogging = { ...callParams };
  callParamsForLogging.spec = "[omitted]";
  this.logger.trace("Call parameters with 'securities': %j", callParamsForLogging);
  callParamsForLogging.securities = "[omitted]";
  this.logger.info("Final Call params: %j", callParamsForLogging);
  let response;
  try {
    response = await executeSwaggerCall.call(this, callParams);
  } catch (e) {
    if (e instanceof Error && e.response) {
      const response = e.response;
      this.logger.error(
        "API error! Status: '%s', statusText: %s, errorBody: %j",
        response.status,
        response.statusText,
        response.body
      );
    }
    throw e;
  }
  const { url, status, body, headers } = response;

  // exception for Slack, because they return error with 200 status code
  if (body && "ok" in body && typeof body.ok === "boolean" && !body.ok) {
    this.logger.error(
      "API error! Status: '%s', statusText: %s, errorBody: %j",
      response.status,
      response.statusText,
      response.body
    );
    throw new Error(body.error || "API returned erroneous response");
  }

  this.logger.info("Swagger response %j", { status, url, body, headers });
  return { body, headers };
};

const getFileName = (fileUrl) => {
  const parsedUrl = new URL(fileUrl);
  const filePath = parsedUrl.pathname;
  const title = path.basename(filePath);
  if (!title) {
    throw new Error("Cannot find filename in provided url");
  }
  return title;
};

const downloadFileFromUrl = async (fileUrl) => {
  const title = getFileName(fileUrl);
  const response = await axios({
    method: "GET",
    url: fileUrl,
    responseType: "arraybuffer",
  });
  return new File([response.data], title);
};

const getInputMetadataSchema = (metadataPath) => {
  const inputMetadata = fs.readFileSync(metadataPath, "utf-8");
  return JSON.parse(inputMetadata).properties.requestBody.properties;
};

const mapFormDataBody = async function (action, body) {
  this.logger.info("Going to import Input Metadata Schema...");
  let inputMetadataSchema = getInputMetadataSchema(action.metadata.in);
  this.logger.info("Input Metadata Schema: %j", inputMetadataSchema);
  for (const key of Object.keys(body)) {
    this.logger.info("Body property '%s' has type: %s", key, inputMetadataSchema[key].type);
    if (
      inputMetadataSchema[key].type === "string" &&
      inputMetadataSchema[key].format &&
      inputMetadataSchema[key].format === "binary"
    ) {
      this.logger.info(
        "For body property '%s' detected 'binary' format. Going to download binary data from provided URL: %s",
        key,
        body[key]
      );
      let fileUrl;
      try {
        fileUrl = new URL(body[key]);
      } catch (e) {
        this.logger.error(
          "Body property '%s' has binary format and require valid URL as value, but has %s",
          key,
          body[key]
        );
      }
      this.logger.info("Going to download File from provided URL...");
      const fileContent = await downloadFileFromUrl(fileUrl);
      this.logger.info("File was successfully downloaded");
      body[key] = fileContent;
    }
  }
  return body;
};

function compareDate(a, b) {
  return dayjs(a).isAfter(b);
}

function mapFieldNames(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(mapFieldNames);
  } else if (typeof obj === "object" && obj) {
    obj = Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));
    return obj;
  }
}
function getMetadata(metadata) {
  const metadataKeys = ["oihUid", "recordUid", "applicationUid"];
  let newMetadata = {};
  for (let i = 0; i < metadataKeys.length; i++) {
    if (metadataKeys[i] in metadata && metadata[metadataKeys[i]])
      newMetadata[metadataKeys[i]] = metadata[metadataKeys[i]];
  }
  return newMetadata;
}

function isMicrosoftJsonDate(dateStr) {
  const regex = /^\/Date\((\d+)([+-]\d{4})?\)\/$/;
  if (regex.test(dateStr)) {
    const match = dateStr.match(regex);
    const milliseconds = parseInt(match[1]);
    const timeZoneOffset = match[2] ? parseInt(match[2]) / 100 : 0;
    return new Date(milliseconds + timeZoneOffset * 60 * 60 * 1000);
  } else {
    return null;
  }
}

async function dataAndSnapshot(newElement, snapshot, snapshotKey, standardSnapshot, self) {
  if (Array.isArray(newElement.data)) {
    this.logger.info("Found %s items in response data", newElement.data.length);
    let lastObjectDate = 0;
    let emittedItemsCount = 0;
    for (let i = 0; i < newElement.data.length; i++) {
      const newObject = { ...newElement, data: newElement.data[i] };
      let currentObjectDate = lodashGet(newObject.data, snapshotKey)
        ? lodashGet(newObject.data, snapshotKey)
        : lodashGet(newObject.data, standardSnapshot);
      if (currentObjectDate) {
        const parsedDate = isMicrosoftJsonDate(currentObjectDate);
        if (parsedDate) {
          this.logger.info("Microsoft JSON date format detected, parsed date: %s", parsedDate);
          currentObjectDate = parsedDate;
        }
      }
      if (!snapshot.lastUpdated) {
        if (compareDate(currentObjectDate, lastObjectDate)) {
          lastObjectDate = currentObjectDate;
        }
        await self.emit("data", newObject);
        emittedItemsCount++;
      } else {
        if (compareDate(currentObjectDate, snapshot.lastUpdated)) {
          if (compareDate(currentObjectDate, lastObjectDate)) {
            lastObjectDate = currentObjectDate;
          }
          await self.emit("data", newObject);
          emittedItemsCount++;
        }
      }
    }
    this.logger.info("%s items were emitted", emittedItemsCount);
    snapshot.lastUpdated = lastObjectDate !== 0 ? lastObjectDate : snapshot.lastUpdated;
    await self.emit("snapshot", snapshot);
    this.logger.info("A new snapshot was emitted: %j", snapshot);
  } else {
    this.logger.info("Found one item in response data, going to emit...");
    await self.emit("data", newElement);
  }
}
function getElementDataFromResponse(splittingKey, res) {
  if (!splittingKey) {
    this.logger.info("Splitting key missing, going to return original data...");
    return res;
  } else {
    this.logger.info("Going to split result by key: %s", splittingKey);
    return splittingKey.split(".").reduce((p, c) => (p && p[c]) || null, res);
  }
}

function getInitialSnapshotValue(cfg, snapshot) {
  let initialSnapshot;

  if (snapshot && snapshot.lastUpdated) {
    initialSnapshot = snapshot.lastUpdated;
  } else {
    initialSnapshot = new Date(0).getTime();
  }

  if (cfg && cfg.nodeSettings && cfg.nodeSettings.initialSnapshot) {
    const initial = dayjs(cfg.nodeSettings.initialSnapshot);
    const incoming = dayjs(initialSnapshot);
    if (initial.isValid && incoming.isValid && initial.isAfter(incoming)) {
      initialSnapshot = cfg.nodeSettings.initialSnapshot;
    }
  }

  return initialSnapshot;
}

module.exports = {
  compareDate,
  mapFieldNames,
  getMetadata,
  dataAndSnapshot,
  getElementDataFromResponse,
  mapFormDataBody,
  isMicrosoftJsonDate,
  executeCall,
  getInitialSnapshotValue
};
