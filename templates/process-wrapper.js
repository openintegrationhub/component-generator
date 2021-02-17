/**
 * : <%= packageName %>
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

// const ferryman = require('@openintegrationhub/ferryman');
// const messages = ferryman.messages;

/**
 * Receives an action process function and returns a wrapper around it
 * Extra functionality:
 * - this.emitData(data)
 *
 * Usage:
 * const processWrapper = require('../services/process-wrapper.js');
 * exports.process = processWrapper(processAction);
 *
 * @param {function} processFn - the function to wrap
 * @returns {function} - the wrapper with additional functionality
 */
module.exports = function processWrapper(processFn) {
    let num_emit = 0;
    return function() {
        let originalEmit = this.emit;
        this.emit = (type, msg) => {
            console.log('---EMIT', ++num_emit, type, JSON.stringify(msg));
            return originalEmit.call(this, type, msg);
        };
        this.emit('data', data);

        return Promise.resolve()
            .then(() => processFn.apply(this, arguments))
            .then(() => undefined);
    };
};