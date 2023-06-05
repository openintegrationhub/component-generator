const { createPaginator, CursorPaginator, NoPagingPaginator } = require("./paginator");

describe("Paginators", () => {
  describe("createPaginator", () => {
    it("should create CursorPaginator", () => {
      const paginator = createPaginator({
        strategy: {
          type: "cursor",
          in: "body",
          nextCursorPath: "meta.next.token",
        },
      });

      expect(paginator).toBeInstanceOf(CursorPaginator);
    });

    it("should create NoPagingPaginator", () => {
      const paginator = createPaginator({
        strategy: {
          type: "idontknow",
          in: "body",
          nextCursorPath: "meta.next.token",
        },
      });

      expect(paginator).toBeInstanceOf(NoPagingPaginator);
    });
  });

  describe("CursorPaginator", () => {
    it("should return correct next page token", () => {
      const paginator = new CursorPaginator({
        strategy: {
          type: "cursor",
          in: "body",
          nextCursorPath: "meta.next.token",
        },
      });

      const response = {
        headers: {},
        body: {
          meta: {
            next: {
              token: "next-page-token",
            },
          },
        },
      };

      expect(paginator.hasNextPage(response)).toBeTruthy();
      expect(paginator.getNextPageToken(response)).toBe("next-page-token");
    });
  });

  describe("NoPagingPaginator", () => {
    it("should always return no pages", () => {
      const paginator = new NoPagingPaginator();

      expect(paginator.hasNextPage()).toBeFalsy();
      expect(paginator.getNextPageToken()).toBeFalsy();
    });
  });
});
