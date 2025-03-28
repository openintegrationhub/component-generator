const lodashGet = require("lodash.get");
const crypto = require('crypto');

module.exports.createPaginator = function createPaginator(config) {
  if (config.strategy.type === "cursor") {
    return new CursorPaginator(config);
  } else if (config.strategy.type === "page_increment") {
    return new PageIncrementPaginator(config);
  } else if (config.strategy.type === "offset_increment") {
    return new OffsetIncrementPaginator(config);
  }
  return new NoPagingPaginator();
};

class CursorPaginator {
  constructor(config) {
    this.config = config;
    this.lastPageHash = "";
  }

  hasNextPage({ headers, body }) {
    const hashedBody = crypto.createHash('sha256').update(JSON.stringify(body), 'utf8').digest('hex');
    if (hashedBody === this.lastPageHash) {
      console.warn("Received same data twice in a row, aborting pagination...")
      return false;
    }
    this.lastPageHash = hashedBody;

    return !!this.getNextPageToken({ headers, body });
  }

  getNextPageToken({ headers, body }) {
    const nextCursorLocation = this.config.strategy.tokenIn === "body" ? body : headers;
    return lodashGet(nextCursorLocation, this.config.strategy.nextCursorPath);
  }
}

class PageIncrementPaginator {
  page = 1;

  constructor(config) {
    this.config = config;
    this.lastPageHash = "";
  }

  hasNextPage({ body }) {
    const hashedBody = crypto.createHash('sha256').update(JSON.stringify(body), 'utf8').digest('hex');
    if (hashedBody === this.lastPageHash) {
      console.warn("Received same data twice in a row, aborting pagination...")
      return false;
    }
    this.lastPageHash = hashedBody;

    const resultsPath = [];
    if (this.config.strategy.resultsPath) {
      resultsPath.push(...this.config.strategy.resultsPath.split('.'));
    }
    resultsPath.push("length");

    return lodashGet(body, resultsPath) === this.config.strategy.pageSize;
  }

  getNextPageToken() {
    return ++this.page;
  }
}

class OffsetIncrementPaginator {
  offset = 0;

  constructor(config) {
    this.config = config;
    this.lastPageHash = "";
  }

  hasNextPage({ body }) {
    const hashedBody = crypto.createHash('sha256').update(JSON.stringify(body), 'utf8').digest('hex');
    if (hashedBody === this.lastPageHash) {
      console.warn("Received same data twice in a row, aborting pagination...")
      return false;
    }
    this.lastPageHash = hashedBody;

    const resultsPath = [];
    if (this.config.strategy.resultsPath) {
      resultsPath.push(...this.config.strategy.resultsPath.split('.'));
    }
    resultsPath.push("length");

    return lodashGet(body, resultsPath) === this.config.strategy.pageSize;
  }

  getNextPageToken() {
    this.offset += this.config.strategy.pageSize;
    return this.offset;
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
  OffsetIncrementPaginator,
  NoPagingPaginator,
});
