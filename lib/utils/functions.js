const _ = require('lodash');
const path = require('path');
const { transliterate } = require('transliteration');
const { addCredentials } = require('./addCredentialsForComponentJson');
const { templates } = require('./templates');
const htmlToText = require('html-to-text');
const fse = require('fs-extra');

function containsHtml(text) {
  if (!text) {
    return false;
  }
  text = text.trim();
  return text[0] === '<' && text.slice(-1)[0] === '>';
}
function traverseObject(object, processFn) {
  if (!object || typeof object !== 'object') {
    return;
  }
  _.forOwn(object, (val, key) => {
    processFn(val, key, object);
    traverseObject(val, processFn);
  });
}

function toText(text) {
  if (containsHtml(text)) {
    text = htmlToText.fromString(text);
  }
  return text;
}

function filename(...parts) {
  return './' + path.posix.join(...parts);
}

function toMD(text, options = {}) {
  text = (text || '').trim();
  if (containsHtml(text)) {
    if (options.quote) {
      text = '<blockquote>' + text + '</blockquote>';
    }
    if (options.minHeaderLevel) {
      let headerBump =
        options.minHeaderLevel -
        Math.min(
          ...(text.match(/<h[0-9]\b/g) || []).map((h) => Number(h.slice(2)))
        );
      text = text.replace(
        /(<\/?h)([0-9])\b/g,
        (m, p1, p2) => p1 + (Number(p2) + headerBump)
      );
    }
  } else {
    text = text.replace(/$/gm, '<br/>');
    if (options.quote) {
      text = text.replace(/^/gm, '> ');
    }
  }
  return text;
}
function transliterateObject(object) {
  traverseObject(object, (val, key, obj) => {
    if (typeof val === 'string') {
      obj[key] = transliterate(val);
    }
  });
}
function quote(str) {
  return str && "'" + str.replace(/[\\"']/g, '\\$&') + "'";
}
async function copyTemplate(src, dest = '', outputDir) {
  //console.log('Writing file %s...', dest);
  await fse.copy(
    path.join(__dirname, '../../', 'templates', src),
    path.join(outputDir, dest)
  );
}
async function output(filename, text, data, outputDir) {
  if (data) {
    text = _.template(text, {})(data);
  } else if (typeof text !== 'string') {
    text = JSON.stringify(
      text,
      (key, value) => (key.startsWith('$') ? undefined : value),
      4
    );
  }
  //console.log('Writing file %s', filename);
  return await fse.outputFile(path.join(outputDir, filename), text);
}
async function getComponentJson(apiTitle, api, swaggerUrl) {
  const textDescription = toText(api.info.description);

  const componentJson = Object.assign(JSON.parse(templates.componentTemplate), {
    title: apiTitle,
    description: textDescription,
    docsUrl: (api.externalDocs && api.externalDocs.url) || '',
    url: swaggerUrl,
  });

  await addCredentials(componentJson, api);
  return componentJson;
}

module.exports = {
  transliterateObject,
  quote,
  toText,
  toMD,
  filename,
  copyTemplate,
  getComponentJson,
  output
};
