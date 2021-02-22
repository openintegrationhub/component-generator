const Q = require('q');
// const { config } = require('chai');
// const { resolve } = require('../utils/resolver');
const { upsertObject } = require('../utils/helpers');
const uuid = require('uuid');


/**
 * createPerson creates a new person.
 *
/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */

 module.exports.process = processWrapper(processAction);

function newMessage(body) {
  const msg = {
    id: uuid.v4(),
    attachments: {},
    body,
    headers: {},
    metadata: {},
  };

  return msg;
}

async function processAction(msg, cfg) {
  const self = this;
  const oihUid = msg.body.meta !== undefined && msg.body.meta.oihUid !== undefined
    ? msg.body.meta.oihUid
    : 'oihUid not set yet';
  const recordUid = msg.body !== undefined && msg.body.meta.recordUid !== undefined
    ? msg.body.meta.recordUid
    : undefined;
  const applicationUid = msg.body.meta !== undefined && msg.body.meta.applicationUid !== undefined
    ? msg.body.meta.applicationUid
    : undefined;


    $SECURITIES

    let callParams = {
        spec: spec,
        operationId: $OPERATION_ID,
        pathName: $PATH,
        method: $METHOD,
        parameters: parameters,
        requestContentType: contentType,
        requestBody: body.requestBody,
        securities: {authorized: securities},
        server: spec.servers[cfg.server] || cfg.otherServer,
    };

    const contentType = $CONTENT_TYPE;

    mapFieldNames(msg.body.data);

  async function emitData() {
    /** Create an OIH meta object which is required
     * to make the Hub and Spoke architecture work properly
     */
    const objectExists = false;
    const newElement = {}; 
    const oihMeta = {
      applicationUid,
      oihUid,
      recordUid,
    };


    // Upsert the object depending on 'objectExists' property
    // if(callParams.method === "'post'"){
    // const reply = await createObject(callParams);
    // return reply
    // }  else if (callParams.method === "'patch'"){
    const reply = await upsertObject(msg, callParams.securities, objectExists, callParams.pathName, msg.body.meta,callParams);
    //   return reply
    // }

    oihMeta.recordUid = reply.body.payload.uid;
    delete reply.body.payload.uid;
    newElement.meta = oihMeta;
    newElement.data = reply.body.payload;

    self.emit('data', newMessage(newElement));
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    console.error('ERROR: ', e);
    console.log('Oops! Error occurred');
    self.emit('error', e);
  }

  /**
   * This method will be called from OIH platform
   * when the execution is finished successfully
   *
   */
  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  return Swagger.execute(callParams).then(() => {
    // emit a single message with data
    Q().then(emitData).fail(emitError).done(emitEnd);
    // if the response contains an array of entities, you can emit them one by one:
    // data.obj.someItems.forEach((item) => {
    //     this.emitData(item);
    // }
});


}

function mapFieldNames(obj) {
    if(Array.isArray(obj)) {
        obj.forEach(mapFieldNames);
    }
    else if(typeof obj === 'object' && obj) {
        Object.keys(obj).forEach(key => {
            mapFieldNames(obj[key]);

            let goodKey = FIELD_MAP[key];
            if(goodKey && goodKey !== key) {
                obj[goodKey] = obj[key];
                delete obj[key];
            }
        });
    }
}

module.exports = {
  process: processAction,
};
