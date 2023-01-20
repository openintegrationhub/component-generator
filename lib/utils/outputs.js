const semver = require('semver');
const {
  toText,
  transliterateObject,
  toMD,
  output,
  copyTemplate,
} = require('./functions');
const { scripts } = require('../scripts');
const { templates, templatesToCopy, contentPathArray } = require('./templates');
const moment = require('moment');
const { getActionAndSecuritySchemes } = require('./createActionAndSecuritySchemes');

// output(filename, text) -> simply outputs the text
// output(filename, text, data) -> uses text as a template and interpolates the data using lodash syntax https://lodash.com/docs/4.17.11#template
// output(filename, data) -> outputs data as JSON

async function outputs(packageName, api, swaggerUrl, componentJson, outputDir, apiTitle, snapshot) {
  let version = api.info.version;
  let sv = semver.coerce(api.info.version);
  if (!sv) {
    version = '0.0.1';
  } else {
    version = sv.version;
  }

  let textDescription = toText(api.info.description);
  for (let i = 0; i < templatesToCopy.length; i++) {
    await copyTemplate(templatesToCopy[i], templatesToCopy[i], outputDir);
  }
  const ACTION = getActionAndSecuritySchemes(
    api,
    apiTitle,
    packageName,
    snapshot
  );

  for (let i = 0; i < contentPathArray.length; i++) {
    let content = contentPathArray[i].template.replace(
      /\$([a-z_0-9]+)/gi,
      (match, p1) => ACTION[p1]
    );
    await output(contentPathArray[i].path, content, undefined, outputDir);
  }
  await output('lib/spec.json', api, undefined, outputDir);
  await output(
    'package.json',
    Object.assign(JSON.parse(templates.packageTemplate), {
      name: packageName,
      version: version,
      description: textDescription,
      scripts: scripts,
    }),
    undefined,
    outputDir
  );
  await output(
    'package-lock.json',
    Object.assign(JSON.parse(templates.packagelockTemplate), {
      name: packageName,
      version: version,
    }),
    undefined,
    outputDir
  );

  await output(
    'lib/utils/helpers.js',
    templates.helpersTemplate,
    undefined,
    outputDir
  );

  transliterateObject(componentJson);
  await output('component.json', componentJson, undefined, outputDir);

  await output(
    'README.md',
    templates.readmeTemplate,
    {
      api: api,
      openapiUrl: swaggerUrl,
      moment: moment,
      componentJson: componentJson,
      packageName: packageName,
      toText: toText,
      toMD: toMD,
    },
    outputDir
  );
}

module.exports = {
  output,
  outputs,
};
