const dayjs = require("dayjs");

function isSecondDateAfter(a, b) {
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

module.exports = { isSecondDateAfter, mapFieldNames, getMetadata };
