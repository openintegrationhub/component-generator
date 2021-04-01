/**
 * : OIH-openapi-component-generator
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

/**
 * Custom http resolver for json-schema-ref-parser to support a proxy server
 *
 * https://www.npmjs.com/package/json-schema-ref-parser
 * https://apidevtools.org/json-schema-ref-parser/docs/plugins/resolvers.html
 * https://github.com/APIDevTools/json-schema-ref-parser/blob/master/lib/resolvers/http.js
 */

const request = require("./request").promise;

module.exports = {
  order: 200,
  /**
   * Determines whether this resolver can read a given file reference.
   * Resolvers that return true will be tried in order, until one successfully resolves the file.
   * Resolvers that return false will not be given a chance to resolve the file.
   *
   * @param {object} file           - An object containing information about the referenced file
   * @param {string} file.url       - The full URL of the referenced file
   * @param {string} file.extension - The lowercased file extension (e.g. ".txt", ".html", etc.)
   * @returns {boolean}
   */
  canRead: function isHttp(file) {
    return (
      file &&
      file.url &&
      (file.url.startsWith("http://") || file.url.startsWith("https://"))
    );
  },

  /**
   * Reads the given URL and returns its raw contents as a Buffer.
   *
   * @param {object} file           - An object containing information about the referenced file
   * @param {string} file.url       - The full URL of the referenced file
   * @param {string} file.extension - The lowercased file extension (e.g. ".txt", ".html", etc.)
   * @returns {Promise<Buffer>}
   */
  read: function readHttp(file) {
    return request(file.url).catch((error) => {
      //console.log('error', error);
      return Promise.reject(
        error.statusCode + " " + error.name + " " + error.options.uri
      );
    });
  },
};
