# component-generator
Generator to create OIH integration components based on OpenAPI 3 / Swagger specifications. Based on https://github.com/flowground/elasticio-openapi-component-generator

## Description

This service receives a Swagger/OpenAPI API specification and generates a connector out of it.\
The required input is an URL or a local file. Both versions are supported, Swagger v2 and
OpenAPI v3.\
Internally, every Swagger file is converted to OpenAPI v3.\
The generator stores all files in a specific output directory (provided as an option or chosen during execution).

## Usage

### NodeJS script
```shell
node bin/oih-gen.js -o <Output directory> -n <Connector name> <Swagger/OpenAPI file location|Swagger/OpenApi URL> 
```
### CLI command
```shell
oih-gen --help
oih-gen -s <snapshot> -o <Output directory> -n <Connector name> <Swagger/OpenAPI file location|Swagger/OpenApi URL> 
```
### Command line arguments and options and path build
The options provided to the command line should create the path for the created components:
For example if I do create a component and I give output value ./desktop and on top I give my component a name like MyComponent the generator will create nested folders on the desktop
That means there should be on the desktop a desktop folder which contains the generated MyComponent (./desktop/MyComponent/...)

- `url|file` - URL of Swagger/OpenAPI specification or path to file where specification is stored
(options)
- `-s` or `--snapshot` - snapshot property to be passed as default in the triggers
- `-o` or `--output` - output directory where to store the connector files (default: `output`)
- `-n` or `--name` - connector name used as a package name in package.json (default: extracted from title provided in Swagger/OpenAPI definition)\
Unless `-y`, `--yes` option is provided, if output or name options are missing, user will be prompt with questions having default values.
- `-y` or `--yes` - skip questionnaire and populate all options with default values
- `-h` or `--help` - show help

### Templates folder

This is the folder where the files that are copied during the generation reside

Action.js is the template copied to actions

Trigger.js is the template copied to triggers
    Properties to be considered:
        "snapshotKey" is the parameter passed for the selected trigger to compare with snapshot date and it is to replace the default snapshot passed by the generation in each trigger
        "arraySplittingKey" is the key used for access the object returned from the get request
        "syncParam" is the param used for filtering the response in the API call

** As from now we use a generic Action and a Trigger for the the flow execution (look also to the component.json file )

The action and the trigger process the tokenData object and grab the operationId which they use to query the object with the same name in the component.json. From there they get the callParams object which contains the method, the pathName and the contentType. From that point we use the values from the object to make the Swagger call as before.

testAction.js is the template copied to tests
testTrigger.js is the template copied to tests

The test contain pretty much a copy of the real trigger and action. The only difference is that the whole proces is run through a loop in order to make the call to the specific API back to back.

Component.json is the file where all the data for the component is stored. From the auth type till every operationId as well as the methods and the names of the paths for every action or trigger. 


helpers.js is the template file containing functions used in the triggers and actions
    funtions:
        isSecondDateAfter() is the function comparing incoming snapshot and the current object date
        mapFieldNames() is the function that goes through all the parameters of the msg.data object and returns an object with the keys
        getMetaData() creates a object needed for the OIH id linking process
        dataAndSnapshot() emits the events for the data and snapshot objects and pushes them to the next component/API
        getElementDataFromResponse() parses the path of the arraySplittingKey for returning the response array if it exists otherwise it returns the single object


We add basic docker config as well as a docker ignoring file

Package.json and package-lock.json with the latest dependencies which are loaded while running the build docker image command

README file gets written on the fly on the generation with all the triggers and actions listed.

### Lib folder

Download.js file grabs the json url and brings the file in the generator for validation
Validate.js file checks the json file if it is valid and can be regenerated
Scripts.js file gets the scripts needed for the package json in the component
Generate.js file is all about parsing and generating the new files. 

## Utils

 addCredentialsForComponentJson.js => adds the credentials object in the component json file on generation time
 functions.js has all the functions needed for processing files 
    containsHtml() checks the input for html and picks up the content
    traverseObject() checks if the input is an object and then traverses it 
    toText() takes the given html and returns a string text
    filename() defines the filename of the outputed file
    toMD() takes the text/html and converts it in a MD file
    transliterateObject() traverses the given object and then translitarates it using the translitaration lib  
    quote() puts quotes on a string 
    copyTemplate() takes a template from the templates dir and copies it in the outputDir
    output() used to output files in the generated component

 outputs.js is the file that has all the output Promises for the file production

 recursiveSearch.js is the file that picks the schemaOut for every trigger
 schemaAndComponentJsonBuilder.js is the function that builds the component json file and returns it for output
 securitySchemes.js adds the schemes and variables for testing
 templates.js has all the templates readen and ready for use by the functions above

# Currently the parser can not support OPEN API version 3.0.3

# Installing info

When the component is generated make sure you run the npm install command so that you have the latest dependencies installed

Docker uses node 16 and requires the package lock json to work so it is important to have the latest deps installed so they can be copied in the image for production.




<!-- #### Install npm package

##### Install package and require module to use it as a library
```shell
npm install -g oih-openapi-component-generation
```

```
require('oih-openapi-component-generation').eioGen();

const {download, validate, generate} = require('oih-openapi-component-generation');
``` -->

<!-- ##### Install globally to use it as a CLI
```shell
npm install -g oih-openapi-component-generation
oih-gen -h
``` -->