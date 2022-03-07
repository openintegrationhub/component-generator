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
// let xLogo = api.info['x-logo'];
// if (xLogo && xLogo.url) {
//     let logoUrl = xLogo.url;
//     let logoPng = path.join(outputDir, filename('logo.png'));
//     if (logoUrl.endsWith('.svg')) {
//         waitFor.push(new Promise((resolve) => {
//             gm(request(logoUrl)).resize(60, 60).write(logoPng, function (err) {
//                 if (err) {
//                     console.error('error converting logo, using default logo', err);
//                     copyTemplate('logo.png', 'logo.png'); // default logo
//                     //return reject(err);
//                 }
//                 resolve();
//             });
//         }));
//     }
//     else {
//         waitFor.push(jimp.read(logoUrl).then(logo => {
//             return logo.contain(60, 60).writeAsync(logoPng);
//         }).catch(err => {
//             console.error('error converting logo, using default logo', err);
//             copyTemplate('logo.png', 'logo.png'); // default logo
//         }));
//     }
// } else {
// copyTemplate('logo.png', 'logo.png'); // default logo
// }
