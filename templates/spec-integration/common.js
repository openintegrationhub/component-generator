require("dotenv").config();
const sinon = require("sinon");
const axios = require("axios");
const bunyan = require("bunyan");
let log = bunyan.createLogger({name: "flowMateConnector"});

const secretID = process.env.SECRET_ID;
const bearerToken = process.env.BEARER_TOKEN;
const secretUrl = process.env.SECRET_URL || "https://secrets.openintegrationhub.com/secrets/";

const getContext = () => ({
  emit: sinon.spy(),
  logger: log
});
const getAccessToken = async () => {
  const secret = await axios.get(`${secretUrl}${secretID}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  });
  return  secret.data.data.value.accessToken;
};

module.exports = { getContext, getAccessToken };
