/**
 * This action will be called via REST API http://node:port/process and works like an express js middleware
 * Make sure that an appropriate response is sent. Unexpected errors are caught by an error handler
 *
 * @param {Function} req - express js middleware
 * @param {Function} res - express js middleware
 * @param {Function} next - express js middleware
 * @param {Object} actionParams - action parameters - { actionName: "string", secretId: "string", data: "object"}
 */

const { process: triggerProcess } = require('../triggers/trigger');

/*
* data will have the following format: 
 {
    operationId => for example getCampaigns
    parameters => msg (usually empty object)
    cfg
 }
*/
async function processAction(req, res, _, actionParams) {
  const { secretId, data } = actionParams;
  const { ferryman } = req;
  const { operationId, parameters, cfg } = data;

  // in the data it should be always the operationId
  // we remove because it is not a parameter of the msg data object
  const msg = { data: parameters || {} };

  const snapshot = {},
    incomingMessageHeaders = {};
  const tokenData = { function: operationId };

  // only when the secretId parameter is provided
  if (secretId) {
    const { authorization } = req.headers;
    const splittedAuthorization = authorization.split(' ');
    const token = splittedAuthorization[1];

    try {
      const secret = await ferryman.fetchSecret(secretId, token);
      Object.assign(cfg, secret);
    } catch (error) {
      console.log('Error getting the secret', error);
    }
  }

  const dataResponse = await triggerProcess(
    msg,
    cfg,
    snapshot,
    incomingMessageHeaders,
    tokenData
  );

  return res.send(dataResponse);
}

module.exports.process = processAction;
