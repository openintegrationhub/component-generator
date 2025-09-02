const {
  isMicrosoftJsonDate,
  getInitialSnapshotValue,
  compareDate,
  formatApiKey
} = require("./helpers");
const dayjs = require('dayjs');

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

    it("should handle integer comparisons", () => {
      const result = compareDate(4, 0);
      expect(result).toEqual(true);
    });
  });


  describe("getInitialSnapshotValue", () => {
    it("should return null date when nothing is set", () => {
      const initialSnapshot = getInitialSnapshotValue({}, {});
      expect(initialSnapshot).toEqual(new Date(0).getTime());
    });

    it("should return received snapshot value when no initial Snapshot is set", () => {
      const initialSnapshot = getInitialSnapshotValue({}, { lastUpdated: dayjs('10-20-2020').format() });
      expect(initialSnapshot).toEqual(dayjs('10-20-2020').format());
    });

    it("should return initialSnapshot value when no snapshot is received", () => {
      const initialSnapshot = getInitialSnapshotValue({ nodeSettings: { initialSnapshot: dayjs('10-19-2020').format() } }, {});
      expect(initialSnapshot).toEqual(dayjs('10-19-2020').format());
    });

    it("should return received snapshot value when it is newer than initial snapshot", () => {
      const initialSnapshot = getInitialSnapshotValue({ nodeSettings: { initialSnapshot: dayjs('10-19-2020').format() } }, { lastUpdated: dayjs('10-20-2020').format() });
      expect(initialSnapshot).toEqual(dayjs('10-20-2020').format());
    });

    it("should return initialSnapshot value when it is is newer than received snapshot", () => {
      const initialSnapshot = getInitialSnapshotValue({ nodeSettings: { initialSnapshot: dayjs('10-21-2020').format() } }, { lastUpdated: dayjs('10-20-2020').format() });
      expect(initialSnapshot).toEqual(dayjs('10-21-2020').format());
    });

    it("should return received snapshot if initialSnapshot is malformed", () => {
      const initialSnapshot = getInitialSnapshotValue({ nodeSettings: { initialSnapshot: dayjs('1021-2020').format() } }, { lastUpdated: dayjs('10-20-2020').format() });
      expect(initialSnapshot).toEqual(dayjs('10-20-2020').format());
    });

  });

  describe("formatApiKey", () => {
    it("should prefix a key with a given prefix if it is missing", () => {
      const tokenKey = formatApiKey('abcd123', { prefix: 'Token ' });
      expect(tokenKey).toEqual('Token abcd123');
    });

    it("should not prefix a key if it's already correctly formatted", () => {
      const BearerKey = formatApiKey('Bearer abcd123', { prefix: 'Bearer ' });
      expect(BearerKey).toEqual('Bearer abcd123');
    });
  });
});
