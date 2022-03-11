function json(obj) {
  return JSON.stringify(obj, null, 4);
}

// map schema field names to sane ones (without special chars, except of underscore)
function mapSchemaFieldNames(schema, map) {
  if (!schema || !schema.properties) {
    return;
  }
  _.forOwn(schema.properties, (val, key, props) => {
    mapSchemaFieldNames(val, map);
    let goodKey = key.replace(/[^a-z0-9_]/gi, '_');
    if (key !== goodKey) {
      // prevent name clashes
      while (map[goodKey] && map[goodKey] !== key) {
        goodKey += '_';
      }

      // rename key
      props[goodKey] = val;
      delete props[key];
    }
    map[goodKey] = key;
  });
}
function escapeUrlDots(url) {
  return url.replace(/\./g, '%2E');
}