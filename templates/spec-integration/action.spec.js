const { getContext, getAccessToken } = require("./common");
const { expect } = require("chai");
const action = require("../lib/actions/action");

describe("Action test", () => {
  it("should emit data", async () => {
    // SET ACTION NAME HERE
    const actionName = "SET ACTION NAME HERE";
    const accessToken = await getAccessToken();
    const context = getContext();
    const msg = {
      data: {
        // SET DATA HERE
      }
    };
    const cfg = {
      accessToken,
      nodeSettings: {},
      additionalParameters: {
        teamId: 123,
      }
      // SET CONFIGURATION HERE
    };
    const snapshot = {};
    const incomingMessageHeaders = {};
    const tokenData = {
      "function": actionName
    };
    await action.process.call(context, msg, cfg, snapshot, incomingMessageHeaders, tokenData);
    expect(context.emit.callCount).to.be.equal(2);
  });
});
