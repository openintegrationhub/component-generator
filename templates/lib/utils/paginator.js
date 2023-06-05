const lodashGet = require("lodash.get");

module.exports.createPaginator = function createPaginator(config) {
  if (config.strategy.type === "cursor") {
    return new CursorPaginator(config);
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
  NoPagingPaginator,
});
