const {
  isMicrosoftJsonDate
} = require("./helpers");

describe("Helpers", () => {
  describe("isMicrosoftJsonDate", () => {
    it("should convert MicrosoftJsonDate", () => {
      const date = isMicrosoftJsonDate("/Date(1577836800000)/");
      expect(date).toEqual(new Date("2020-01-01T00:00:00.000Z"));
    });

    it("should return null", () => {
      const date = isMicrosoftJsonDate("2020-01-01T00:00:00.000Z");
      expect(date).toEqual(null);
    });
  });
});
