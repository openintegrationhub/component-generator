const path = require("path");
const fse = require("fs-extra");

const actionTemplate = readTemplate("lib/actions/action.js");
const componentTemplate = readTemplate("component.json");
const packageTemplate = readTemplate("package.json");
const readmeTemplate = readTemplate("README.md");
const triggerTemplate = readTemplate("lib/triggers/trigger.js");
const eslintTemplate = readTemplate(".eslintrc.js");
const packagelockTemplate = readTemplate("package-lock.json");
const helpersTemplate = readTemplate("lib/utils/helpers.js");
const paginatorTemplate = readTemplate("lib/utils/paginator.js");
const lookupTemplate = readTemplate("lib/lookups/lookup.js");

function readTemplate(file) {
  return fse.readFileSync(path.join(__dirname, "../../", "templates", file), "utf-8");
}

module.exports = {
  templates: {
    componentTemplate,
    packageTemplate,
    readmeTemplate,
    eslintTemplate,
    packagelockTemplate,
    helpersTemplate,
    paginatorTemplate,
  },
  contentPathArray: [
    { template: triggerTemplate, path: "lib/triggers/trigger.js" },
    { template: actionTemplate, path: "lib/actions/action.js" },
    { template: lookupTemplate, path: "lib/lookups/lookup.js" },
  ],
  templatesToCopy: [
    ["gitignore", ".gitignore"],
    "LICENSE",
    "COPYING",
    "LICENSING",
    ".dockerignore",
    "Dockerfile",
    ".eslintrc.js",
    "logo.png",
  ],
};
