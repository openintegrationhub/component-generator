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

    switch (paramsType) {
        case "headers":
            
        break;
        case "query":
            
        break;
        case "path":
            
        break;
        case "cookie":
            
        break;
    
        default:
            break;
    }
    if(paramsType === 'headers') {

    } else if(paramsType === 'url') {
        return value;
    }
}

module.exports = { dateComparison, mapFieldNames, handleParameters };
