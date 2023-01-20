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
  return schemaOut;
}

module.exports = {
  getSchemaOut,
};
