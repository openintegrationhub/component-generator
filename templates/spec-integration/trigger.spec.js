const { getContext, getAccessToken } = require("./common");
const { expect } = require("chai");
const trigger = require("../lib/triggers/trigger");

describe("Trigger test", () => {
  it("should return trigger data", async () => {
    // SET TRIGGER NAME HERE
    const triggerName = "SET TRIGGER NAME HERE";
    const accessToken = await getAccessToken();
    const context = getContext();
    const msg = {data:{}};
    const cfg = {
      accessToken,
      nodeSettings: {}
    };
    const snapshot = {};
    const incomingMessageHeaders = {};
    const tokenData = {
      "function": triggerName
    };
    await trigger.process.call(context, msg, cfg, snapshot, incomingMessageHeaders, tokenData);
    expect(context.emit.callCount).to.be.equal(2);
  });
});
