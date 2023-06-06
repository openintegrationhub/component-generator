const {
  createPaginator,
  CursorPaginator,
  PageIncrementPaginator,
  OffsetIncrementPaginator,
  NoPagingPaginator,
} = require("./paginator");

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

    it("should create PageIncrementPaginator", () => {
      const paginator = createPaginator({
        strategy: {
          type: "page_increment",
        },
      });

      expect(paginator).toBeInstanceOf(PageIncrementPaginator);
    });

    it("should create OffsetIncrementPaginator", () => {
      const paginator = createPaginator({
        strategy: {
          type: "offset_increment",
        },
      });

      expect(paginator).toBeInstanceOf(OffsetIncrementPaginator);
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
    it("should return correct next page token in body", () => {
      const paginator = new CursorPaginator({
        pageTokenOption: {
          fieldName: "after",
        },
        strategy: {
          type: "cursor",
          tokenIn: "body",
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

    it("should return correct next page token in headers", () => {
      const paginator = new CursorPaginator({
        pageTokenOption: {
          fieldName: "after",
        },
        strategy: {
          type: "cursor",
          tokenIn: "headers",
          nextCursorPath: "token",
        },
      });

      const response = {
        headers: {
          token: "next-page-token",
        },
        body: {},
      };

      expect(paginator.hasNextPage(response)).toBeTruthy();
      expect(paginator.getNextPageToken(response)).toBe("next-page-token");
    });
  });

  describe("PageIncrementPaginator", () => {
    it("should return correct next page token", () => {
      const paginator = createPaginator({
        pageSizeOption: {
          fieldName: "per_page",
        },
        pageTokenOption: {
          fieldName: "page",
        },
        strategy: {
          type: "page_increment",
          pageSize: 2,
          resultsPath: "results",
        },
      });

      const response = {
        body: {
          results: [{ id: 1 }, { id: 2 }],
        },
        headers: {},
      };

      expect(paginator.hasNextPage(response)).toBeTruthy();
      expect(paginator.getNextPageToken(response)).toBe(2);
      expect(paginator.getNextPageToken(response)).toBe(3);
    });

    it("should return return no pages if returned less items than perPage", () => {
      const paginator = createPaginator({
        pageSizeOption: {
          fieldName: "per_page",
        },
        pageTokenOption: {
          fieldName: "page",
        },
        strategy: {
          type: "page_increment",
          pageSize: 2,
        },
      });

      const response = {
        body: {
          results: [{ id: 1 }],
        },
        headers: {},
      };

      expect(paginator.hasNextPage(response)).toBeFalsy();
    });

    it("should accept empty resultsPath", () => {
      const paginator = createPaginator({
        pageSizeOption: {
          fieldName: "per_page",
        },
        pageTokenOption: {
          fieldName: "page",
        },
        strategy: {
          type: "page_increment",
          pageSize: 2,
          resultsPath: "",
        },
      });

      const response = {
        body: [{ id: 1 }, { id: 2 }],
        headers: {},
      };

      expect(paginator.hasNextPage(response)).toBeTruthy();
      expect(paginator.getNextPageToken(response)).toBe(2);
      expect(paginator.getNextPageToken(response)).toBe(3);
    });
  });

  describe("OffsetIncrementPaginator", () => {
    it("should return correct next page token", () => {
      const paginator = createPaginator({
        pageSizeOption: {
          fieldName: "per_page",
        },
        pageTokenOption: {
          fieldName: "page",
        },
        strategy: {
          type: "offset_increment",
          pageSize: 2,
          resultsPath: "results",
        },
      });

      const response = {
        body: {
          results: [{ id: 1 }, { id: 2 }],
        },
        headers: {},
      };

      expect(paginator.hasNextPage(response)).toBeTruthy();
      expect(paginator.getNextPageToken(response)).toBe(2);
      expect(paginator.getNextPageToken(response)).toBe(4);
    });

    it("should return return no pages if returned less items than perPage", () => {
      const paginator = createPaginator({
        pageSizeOption: {
          fieldName: "per_page",
        },
        pageTokenOption: {
          fieldName: "page",
        },
        strategy: {
          type: "offset_increment",
          pageSize: 2,
        },
      });

      const response = {
        body: {
          results: [{ id: 1 }],
        },
        headers: {},
      };

      expect(paginator.hasNextPage(response)).toBeFalsy();
    });

    it("should accept empty resultsPath", () => {
      const paginator = createPaginator({
        pageSizeOption: {
          fieldName: "per_page",
        },
        pageTokenOption: {
          fieldName: "page",
        },
        strategy: {
          type: "offset_increment",
          pageSize: 2,
          resultsPath: "",
        },
      });

      const response = {
        body: [{ id: 1 }, { id: 2 }],
        headers: {},
      };

      expect(paginator.hasNextPage(response)).toBeTruthy();
      expect(paginator.getNextPageToken(response)).toBe(2);
      expect(paginator.getNextPageToken(response)).toBe(4);
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
