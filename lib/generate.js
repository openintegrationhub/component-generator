/**
 * : OIH-openapi-component-generator
 * Copyright © 2020,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const SwaggerParser = require('swagger-parser');
const fse = require('fs-extra');
const { templates } = require('./utils');
const { output, outputs } = require('./utils/outputs')
const { getComponentJson,copyTemplate,quote } = require('./utils/functions');
const { getSecuritySchemes } = require('./utils/securitySchemes');
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

    for(i= 0; i< templates.templatesToCopy.length; i++){
        copyTemplate(templates.templatesToCopy[i], templates.templatesToCopy[i]);
    }
    
    let componentJson = await getComponentJson(apiTitle,api,swaggerUrl,this);
    // generate actions
    let existingNames = {};
    let ACTION = {
        API_TITLE: apiTitle,
        PACKAGE_NAME: packageName,
        FIELD_MAP: {},
        NOW: new Date().toISOString(),
        GENERATOR_VERSION: require('../package.json').version,
        SNAPSHOT: quote(snapshot),
    };

    const OTHERPARAMS = getSecuritySchemes(api);
    ACTION = {...ACTION,...OTHERPARAMS };
    ACTION.SECURITIES = ACTION.SECURITIES.join(';\n    ');
    ACTION.TESTSECURITIES = ACTION.TESTSECURITIES.join(';\n    ');
    
    await schemaBuilder(api,componentJson,existingNames);
    
        for(i= 0; i< templates.contentPathArray.length; i++){
        let params = ACTION;
        let content = templates.contentPathArray[i].template.replace(/\$([a-z_0-9]+)/ig, (match, p1) => params[p1]);
        output(templates.contentPathArray[i].path, content);
    }

    await outputs(packageName,api,swaggerUrl,componentJson,outputDir);

  
};

