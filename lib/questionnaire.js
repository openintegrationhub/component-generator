const readline = require("readline");

module.exports = class Questionnaire {
  constructor(skip) {
    this.skip = skip;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Prompt user with a question, together with default value
   * Format: "Question text: (defaultValue)"
   *
   * @param {string} question
   * @param {string} defaultValue
   * @returns {string|Promise<string>} - user input if provided, default value otherwise
   */
  ask(question, defaultValue) {
    if (this.skip) {
      return defaultValue;
    }

    this.rl.setPrompt(question + ": (" + defaultValue + ") ");
    this.rl.prompt();

    return new Promise((resolve) => this.rl.on("line", (userInput) => resolve(userInput || defaultValue)));
  }

  /**
   * Close readline interface
   */
  finish() {
    this.rl.close();
  }
};
