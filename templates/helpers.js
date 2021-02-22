const request = require('request-promise').defaults({
    simple: false,
    resolveWithFullResponse: true,
  });
  const moment = require('moment');
  // const { getToken } = require('./authentication');
  
//   const BASE_URI = 'https://api.personio.de/v1';
  
  /**
   * This method fetches persons or organizations from Personio
   *
   * @param options - request options
   * @param snapshot - current state of snapshot
   * @return {Object} - Array of person objects containing data and meta
   */
  /**
   * @desc Prepares a DTO object for updating
   *
  /**
   * @desc Upsert function which creates or updates
   * an object, depending on certain conditions
   *
   * @access  Private
   * @param {Object} msg - the whole incoming object
   * @param {String} token - token from Personio
   * @param {Boolean} objectExists - ig the object was found
   * @param {String} type - object type - 'person' or 'organization'
   * @param {Object} meta -  meta object containg meta inforamtion
   * @return {Object} - the new created ot update object in Personio
   */
  async function upsertObject(msg,sec, objectExists, type, meta,callparams) { // ,cfg
    if (!type) {
      return false;
    }
  
    let newObject;
    let uri;
    let method;
    
    if (objectExists) {
      // Update the object if it already exists
      method = 'PATCH';
      uri = `${type}/${meta.recordUid}`;
    //   newObject = prepareObject(msg, type);
      delete newObject.uid;
    } else {
      // Create the object if it does not exist
      method = 'POST';
      uri = `${BASE_URI}/company/${type}`;
      newObject = msg;
      delete newObject.uid;
      delete newObject.categories;
      delete newObject.relations;
    }
  
    try {
      const options = {
        method,
        uri,
        json: true,
        headers: {
          Authorization: sec,
        },
        body: newObject,
      };
  
      const person = await request(options);
      return person;
    } catch (e) {
      return e;
    }
  }
  async function createObject(msg, token, type, meta, cfg) {
    if (!type) {
      return false;
    }
  
    // Create the object if it does not exist
    const method = 'POST';
    const uri = `${BASE_URI}/${cfg.company_domain}/${type}`;
    const newObject = msg;
    delete newObject.uid;
    delete newObject.categories;
    delete newObject.relations;
  
    try {
      const options = {
        method,
        uri,
        json: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: newObject,
      };
  
      const object = await request(options);
      return object;
    } catch (e) {
      return e;
    }
  }
  
  /**
   * This method fetches objects from Personio
   * depending on the value of count variable and type
   *
   * @param token - Personio token required for authentication
   * @param snapshot - current state of snapshot
   * @param count - amount of objects
   * @return {Object} - Array of person objects containing data and meta
   */
  async function getEntries(sec, snapshot, type) {

    const uri = `${BASE_URI}/${type}`;
    try {
      const requestOptions = {
        uri,
        json: true,
        headers: {
          sec
        },
      };
      console.log('these are the requestOptions:', requestOptions);
      const entries = await fetchAll(requestOptions, snapshot);
  
      if (!entries.result || !Array.isArray(entries.result)) {
        return 'Expected records array.';
      }
      return entries;
    } catch (e) {
      throw new Error(e);
    }
  }
  

  async function fetchAll(options, snapshot) {
    try {
      const result = [];
      const entries = await request.get(options);
  
      //  console.log("entries:",entries)
  
      if (
        Object.entries(entries.body).length === 0
        && entries.body.constructor === Object
      ) {
        return false;
      }
  
      if (entries.body.data) {
        // eslint-disable-next-line consistent-return
        entries.body.data.forEach((obj) => {
          // Push only this objects which were updated after last function call
          if (
            moment(obj.attributes.last_modified_at.value).isAfter(
              snapshot.lastUpdated,
            )
          ) {
            return result.push(employee);
          }
          // return employee;
        });
      } else {
        console.log(JSON.stringify(entries));
      }
  
      console.log('result:', result);
      // Sort the objects by lastUpdate
      result.sort(
        (a, b) => parseInt(a.attributes.last_modified_at.value, 10)
          - parseInt(b.attributes.last_modified_at.value, 10),
      );
      return {
        result,
        headers: entries.headers,
      };
    } catch (e) {
      throw new Error(e);
    }
  }
  
  module.exports = {
    getEntries, getEntry, upsertObject, createObject,
  };