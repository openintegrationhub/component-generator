const merge = require("deepmerge");
let schemaOut = {};

function recursiveSearch(resp) {
  let value;
  let finalValue = {};
  if (typeof resp === "object" && resp !== undefined) {
    Object.keys(resp).forEach((key) => {
      value = resp[key];
      while (key !== "examples") {
        if (typeof value === "object" && value !== null && value !== undefined) {
          if (key === "schema") {
            finalValue = value;
            finalResult(finalValue);
            return;
          } else {
            return recursiveSearch(value);
          }
        } else {
          return false;
        }
      }
    });
  }
}

function finalResult(res) {
  schemaOut = res;
}

function removeDuplicates(arr) {
  return Array.isArray(arr) ? [...new Set(arr)] : arr;
}

function mergeSchema(schema) {
  if (schema.allOf) {
    return schema.allOf.reduce((merged, subSchema) => {
      return merge(merged, mergeSchema(subSchema));
    }, {});
  }

  if (schema.oneOf) {
    return schema.oneOf.reduce((merged, subSchema) => {
      return merge(merged, mergeSchema(subSchema));
    }, {});
  }

  if (schema.type === "array" && schema.items) {
    return {
      ...schema,
      items: mergeSchema(schema.items)
    };
  }

  if (schema.properties) {
    const mergedProperties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      mergedProperties[key] = mergeSchema(value);
      if (mergedProperties[key].enum) {
        mergedProperties[key].enum = removeDuplicates(mergedProperties[key].enum);
      }
    }
    return { ...schema, properties: mergedProperties };
  }
  return schema;
}

function getSchemaOut(operation) {
  // console.log("first callback",finalResult)
  let successResp = "200";
  let createResp = "201";
  let resp200 = operation.responses[successResp];
  let resp201 = operation.responses[createResp];
  if (resp200 !== undefined) {
    recursiveSearch(resp200);
  } else if (resp201 !== undefined) {
    recursiveSearch(resp201);
  }
  try {
    schemaOut = mergeSchema(schemaOut);
  } catch (e) {
    console.log(e);
  }
  return schemaOut;
}

function getSchemaIn(schemaIn) {
  try {
    schemaIn = mergeSchema(schemaIn);
  } catch (e) {
    console.log(e);
  }
  return schemaIn;
}

module.exports = {
  getSchemaIn,
  getSchemaOut
};
