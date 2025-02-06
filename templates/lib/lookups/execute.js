/**
 * This action will be called via REST API http://node:port/process and works like an express js middleware
 * Make sure that an appropriate response is sent. Unexpected errors are caught by an error handler
 *
 * @param {Function} req - express js middleware
 * @param {Function} res - express js middleware
 * @param {Function} next - express js middleware
 * @param {Object} actionParams - action parameters - { actionName: "string", secretId: "string", data: "object"}
 */

const { process: actionProcess } = require("../triggers/trigger");
const logger = require("@openintegrationhub/ferryman/lib/logging");

/*
* data will have the following format:
 {
    operationId => for example getCampaigns
    parameters => msg
    cfg
 }
*/
async function processAction(req, res, _, actionParams) {
  const { secretId, data } = actionParams;
  const { ferryman } = req;
  const { operationId: functionName, parameters, cfg } = data;

  logger.info({ params: actionParams }, "Running execute with params");

  // in the data it should be always the operationId
  // we remove because it is not a parameter of the msg data object
  const msg = { data: parameters || {}, metadata: {} };

  const snapshot = {},
    incomingMessageHeaders = {};
  const tokenData = { function: functionName };

  // only when the secretId parameter is provided
  if (secretId) {
    const { authorization } = req.headers;
    const splittedAuthorization = authorization.split(" ");
    const token = splittedAuthorization[1];

    try {
      const secret = await ferryman.fetchSecret(secretId, token);
      Object.assign(cfg, secret);
    } catch (error) {
      logger.error(error, "Failed to get secret");
    }
  }

  const context = {
    logger,
    emit() { },
  };

  // ensure that result is returned rathe than emitted
  cfg.returnResult = true;

  const dataResponse = await actionProcess.call(context, msg, cfg, snapshot, incomingMessageHeaders, tokenData);

  logger.info({ response: dataResponse }, "Execute function response");

  return res.send(dataResponse);
}

module.exports.process = processAction;
