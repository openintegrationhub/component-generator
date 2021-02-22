const Q = require('q');
const { getEntries } = require('../utils/helpers');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */


 /// how to define the url from the schemas
 // how to take the snapshot from the connector
 // do we need a snapshot for the connector
 /// 


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
  
async function processTrigger(msg, cfg, snapshot = {}) {
  // Authenticate and get the token from Personio
  const { applicationUid, domainId, schema } = cfg;
  // const token = cfg.API_KEY;
  const self = this;
  console.log(msg.body.data);

  // Set the snapshot if it is not provided
  snapshot.lastUpdated = snapshot.lastUpdated || new Date(0).getTime();


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


  async function emitData() {
    /** Create an OIH meta object which is required
     * to make the Hub and Spoke architecture work properly
     */
    const oihMeta = {
      applicationUid:
        applicationUid !== undefined && applicationUid !== null
          ? applicationUid
          : undefined,
      schema: schema !== undefined && schema !== null ? schema : undefined,
      domainId:
        domainId !== undefined && domainId !== null ? domainId : undefined,
    };

    // Get the total amount of fetched objects
    // let count;
    // const getCount = await getEntries(token, snapshot, count, "organization");
    // count = getCount.count; // eslint-disable-line

    const attendances = await getEntries(callParams.securities, snapshot, callParams.pathName);

    console.log(`Found ${attendances.result.length} new records.`);

    if (attendances.result.length > 0) {
      attendances.result.forEach((elem) => {
        const newElement = {};
        // Attach object uid to oihMeta object

        //   if (cfg.targetApp) {
        //     // If using Snazzy reference handling, add target reference
        //     if (elem.contactData) {
        //       const index = elem.contactData.findIndex(cd => cd.type === `reference:${cfg.targetApp}`);
        //       if (index !== -1) {
        //         oihMeta.recordUid = elem.contactData[index].value;
        //       }
        //     }
        //   } else {
        //   oihMeta.recordUid = elem.uid;
        // }
        oihMeta.recordUid = elem.uid;
        delete elem.uid;
        newElement.meta = oihMeta;
        newElement.data = elem;
        // Emit the object with meta and data properties
        self.emit('data', newMessage(newElement));
      });
      // Get the lastUpdate property from the last object and attach it to snapshot
      snapshot.lastUpdated = attendances.result[attendances.result.length - 1].lastUpdate;
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      self.emit('snapshot', snapshot);
    } else {
      self.emit('snapshot', snapshot);
    }
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    console.log(`ERROR: ${e}`);
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

  Q().then(emitData).fail(emitError).done(emitEnd);
}

module.exports = {
  process: processTrigger,
  getEntries,
};
