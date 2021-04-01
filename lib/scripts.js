module.exports = {
  start: "node ./node_modules/@openintegrationhub/ferryman/runGlobal.js",
  pretest: "eslint lib test --ext .js --ext .json --fix",
  test: "NODE_ENV=test mocha test/* --timeout 10000",
  "test-watch": 'nodemon --exec "npm test " ',
};
