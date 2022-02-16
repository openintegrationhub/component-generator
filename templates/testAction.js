/**
 * Auto-generated test action file for "$API_TITLE" API.
 * Generated at: $NOW
 * Mass generator version: $GENERATOR_VERSION
 *
 * : $PACKAGE_NAME
 * Copyright © 2020,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 *
 */

 const Swagger = require("swagger-client");
 const spec = require("../spec.json");
 const { mapFieldNames, getMetadata } = require("../utils/helpers");
 const componentJson = require("../../component.json");
 
 function processAction(msg, cfg, _s, _h, data) {
   var isVerbose = process.env.debug || cfg.verbose;
 
   console.log("data function:", data["function"]);
   console.log("msg:", msg);
   console.log("cfg:", cfg);
 
   if (isVerbose) {
     console.log(`---MSG: ${JSON.stringify(msg)}`);
     console.log(`---CFG: ${JSON.stringify(cfg)}`);
     console.log(`---ENV: ${JSON.stringify(process.env)}`);
   }
   const action = componentJson.actions[data["function"]];
   const { pathName, method, requestContentType } = action.callParams;
 
   const specPath = spec.paths[pathName];
   const specPathParameters = specPath[method].parameters.map(({ name }) => {
     return name;
   });
 
   const body = msg.data;
   mapFieldNames(body);
 
   let parameters = {};
   for (let param of specPathParameters) {
     parameters[param] = body[param];
   }
   
   $SECURITIES;
 
   if (cfg.otherServer) {
     if (!spec.servers) {
       spec.servers = [];
     }
     spec.servers.push({ url: cfg.otherServer });
   }
 
   let callParams = {
     spec: spec,
     operationId: data["function"],
     pathName: pathName,
     method: method,
     parameters: parameters,
     requestContentType: requestContentType,
     requestBody: body,
     securities: { authorized: securities },
     server: spec.servers[cfg.server] || cfg.otherServer,
   };
   if (callParams.method === "get") {
     delete callParams.requestBody;
   }
 
   if (isVerbose) {
     let out = Object.assign({}, callParams);
     out.spec = "[omitted]";
     console.log(`--SWAGGER CALL: ${JSON.stringify(out)}`);
   }
 
   const newElement = {};
   // Call operation via Swagger client
   return Swagger.execute(callParams).then((data) => {
     // emit a single message with data
     delete data.uid;
     newElement.metadata = getMetadata(msg.metadata);
     newElement.data = data.data;
     console.log("Data to be emitted:",data)
    });
 }
 const ids = [];
 for (let i = 0; i < ids.length; i++ ) {
     const msg = {};
     const cfg = {};
     const data = {};

     processAction(msg,cfg,{},{},data)
 }