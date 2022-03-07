/**
 * : OIH-openapi-component-generator
 * Copyright © 2020,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const SwaggerParser = require('swagger-parser');
const fse = require('fs-extra');
const { contentPathArray, templatesToCopy } = require('./utils/templates');
const { output, outputs } = require('./utils/outputs')
const { getComponentJson,copyTemplate,quote } = require('./utils/functions');
const { getActionAndSecuritySchemes } = require('./utils/createActionAndSecuritySchemes');
const { schemaBuilder } = require('./utils/schemaAndComponentJsonBuilder');

/**
 * Generate a connector
 *
 * @param {object} opts - named arguments
 * @param {string} opts.inputFile - path to local validated swagger definition file
 * @param {string} opts.outputDir - path to the folder where the generated connector files will be saved
 * @param {string} opts.packageName - name to use in generated package.json
 * @param {string} [opts.swaggerUrl] - swagger definition url
 * @param {boolean} [opts.suffixServiceNameToTitle=false] - if true, suffix service name to api title (to differentiate between apis with the same title)
 * @returns {Promise} - resolves when the generation is done; rejected when there is an error during generation
 */
module.exports = async function generate({inputFile, outputDir, packageName, swaggerUrl, snapshot, suffixServiceNameToTitle=false}) {

    let api = await SwaggerParser.parse(inputFile);      
    let apiTitle = api.info.title + (suffixServiceNameToTitle ? ' (' + api.info['x-serviceName'] + ')' : '');
    this.outputDir = outputDir;

    if (!swaggerUrl || !swaggerUrl.match(/^https?:\/\//)) {
        swaggerUrl = api.servers[0].url;
    }

    if (fse.existsSync(outputDir)) {
        fse.removeSync(outputDir);
    }

    for(i= 0; i< templatesToCopy.length; i++){
        copyTemplate(templatesToCopy[i], templatesToCopy[i]);
    }
    
    let componentJson = await getComponentJson(apiTitle,api,swaggerUrl,this);
    let existingNames = {};

    // generate actions
    const ACTION = getActionAndSecuritySchemes(api,apiTitle,packageName,snapshot);
    await schemaBuilder(api,componentJson,existingNames);
    
    for(i= 0; i< contentPathArray.length; i++){
        let content = contentPathArray[i].template.replace(/\$([a-z_0-9]+)/ig, (match, p1) => ACTION[p1]);
        output(contentPathArray[i].path, content);
    }

    await outputs(packageName,api,swaggerUrl,componentJson,outputDir);

  
};

