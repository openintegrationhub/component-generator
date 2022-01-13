const moment = require('moment');

function dateComparison(a, b) {
  return moment(a).isAfter(b);
}

function mapFieldNames(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(mapFieldNames);
  } else if (typeof obj === 'object' && obj) {
    obj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
    return obj;
  }
}
function handleParameters(paramsType,value) {
    if(paramsType === 'headers') {

    } else if(paramsType === 'url') {
        return value;
    }
}

module.exports = { dateComparison, mapFieldNames, handleParameters };
