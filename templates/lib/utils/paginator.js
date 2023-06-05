const lodashGet = require("lodash.get");

module.exports.createPaginator = function createPaginator(config) {
  if (config.strategy.type === "cursor") {
    return new CursorPaginator(config);
  } else if (config.strategy.type === "page_increment") {
    return new PageIncrementPaginator(config);
  }

  return new NoPagingPaginator();
};

class CursorPaginator {
  constructor(config) {
    this.config = config;
  }

  hasNextPage({ headers, body }) {
    return !!this.getNextPageToken({ headers, body });
  }

  getNextPageToken({ headers, body }) {
    const nextCursorLocation = this.config.strategy.in === "body" ? body : headers;
    return lodashGet(nextCursorLocation, this.config.strategy.nextCursorPath);
  }
}

class PageIncrementPaginator {
  page = 0;

  constructor(config) {
    this.config = config;
  }

  hasNextPage({ body }) {
    const resultsPath = [];
    if (this.config.strategy.resultsPath) {
      resultsPath.push(this.config.strategy.resultsPath);
    }
    resultsPath.push("length");

    return lodashGet(body, resultsPath) === this.config.strategy.pageSize;
  }

  getNextPageToken({ headers, body }) {
    return ++this.page;
  }
}

class NoPagingPaginator {
  hasNextPage() {
    return false;
  }

  getNextPageToken() {
    return "";
  }
}

Object.assign(module.exports, {
  CursorPaginator,
  PageIncrementPaginator,
  NoPagingPaginator,
});
