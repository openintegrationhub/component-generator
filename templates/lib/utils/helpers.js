const dayjs = require("dayjs");
const lodashGet = require("lodash.get");
const fs = require("fs");
const FormDataNode = require("formdata-node");
const path = require("path");
const axios = require("axios");
const { File } = FormDataNode;

const getFileName = (fileUrl) => {
  const parsedUrl = new URL(fileUrl);
  const filePath = parsedUrl.pathname;
  const title = path.basename(filePath);
  if (!title){
    throw new Error("Cannot find filename in provided url");
  }
  return title;
};

const downloadFileFromUrl = async (fileUrl) => {
  const title = getFileName(fileUrl);
  const response = await axios({
    method: "GET",
    url: fileUrl,
    responseType: "arraybuffer"
  });
  return new File([response.data], title);
};

const getInputMetadataSchema = (metadataPath) => {
  const inputMetadata = fs.readFileSync(metadataPath, "utf-8");
  return JSON.parse(inputMetadata).properties.requestBody.properties;
};

const mapFormDataBody = async function(action, body) {
  this.logger.info("Going to import Input Metadata Schema...");
  let inputMetadataSchema = getInputMetadataSchema(action.metadata.in);
  this.logger.info("Input Metadata Schema: %j", inputMetadataSchema);
  for (const key of Object.keys(body)) {
    this.logger.info("Body property '%s' has type: %s", key, inputMetadataSchema[key].type);
    if (inputMetadataSchema[key].type === "string" && inputMetadataSchema[key].format && inputMetadataSchema[key].format === "binary") {
      this.logger.info("For body property '%s' detected 'binary' format. Going to download binary data from provided URL: %s", key, body[key]);
      let fileUrl;
      try{
        fileUrl = new URL(body[key]);
      } catch (e) {
        this.logger.error("Body property '%s' has binary format and require valid URL as value, but has %s", key, body[key]);
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
    obj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
    return obj;
  }
}
function getMetadata(metadata) {
  const metadataKeys = ["oihUid", "recordUid", "applicationUid"];
  let newMetadata = {};
  for (let i = 0; i < metadataKeys.length; i++) {
    newMetadata[metadataKeys[i]] =
      metadata !== undefined && metadata[metadataKeys[i]] !== undefined
        ? metadata[metadataKeys[i]]
        : `${metadataKeys[i]} not set yet`;
  }
  return newMetadata;
}

async function dataAndSnapshot(newElement, snapshot, snapshotKey, standardSnapshot, self) {
  if (Array.isArray(newElement.data)) {
    let lastObjectDate = 0;
    for (let i = 0; i < newElement.data.length; i++) {
      const newObject = { ...newElement, data: newElement.data[i] };
      const currentObjectDate = lodashGet(newObject.data, snapshotKey)
        ? lodashGet(newObject.data, snapshotKey)
        : lodashGet(newObject.data, standardSnapshot);
      if (!snapshot.lastUpdated) {
        if (compareDate(currentObjectDate, lastObjectDate)) {
          lastObjectDate = currentObjectDate;
        }
        await self.emit("data", newObject);
      } else {
        if (compareDate(currentObjectDate, snapshot.lastUpdated)) {
          if (compareDate(currentObjectDate, lastObjectDate)) {
            lastObjectDate = currentObjectDate;
          }
          await self.emit("data", newObject);
        }
      }
    }
    snapshot.lastUpdated = lastObjectDate !== 0 ? lastObjectDate : snapshot.lastUpdated;
    console.log("returned a new snapshot", snapshot);
    await self.emit("snapshot", snapshot);
  } else {
    await self.emit("data", newElement);
  }
}
function getElementDataFromResponse(splittingKey, res) {
  if (!splittingKey) {
    return res;
  } else {
    return splittingKey.split(".").reduce((p, c) => (p && p[c]) || null, res);
  }
}
module.exports = {
  compareDate,
  mapFieldNames,
  getMetadata,
  dataAndSnapshot,
  getElementDataFromResponse,
  mapFormDataBody
};
