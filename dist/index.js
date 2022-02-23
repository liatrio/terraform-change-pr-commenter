/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 422:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 20:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 248:
/***/ ((module) => {

module.exports = eval("require")("npm/lib/utils/output");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(422);
const github = __nccwpck_require__(20);
const fs = __nccwpck_require__(147);
const output = __nccwpck_require__(248);

const trackedChanges = {
    "delete": "-",
    "create": "+",
    "update": "!"
}

const myToken = core.getInput('github-token');
const octokit = github.getOctokit(myToken);

const context = github.context;

if (context.eventName === 'pull_request') {
    core.info(`Found PR # ${context.issue.number} from workflow context - proceeding to comment.`)
} else {
    core.warning("Action doesn't seem to be running in a PR workflow context.")
    core.warning("Skipping comment creation.")
    return;
}

const inputFilenames = core.getMultilineInput('json-file');

function fileComment(inputFile, showFileName) {
    const changes = JSON.parse(fs.readFileSync(inputFile)).resource_changes;

    let message = "";

    for (const action in trackedChanges) {
        if (changes.filter(obj => obj.change.actions.includes(action)).length === 0) {
            continue
        }
        message += `\n#### Resources to ${action}: \n\n`
        message += '```diff\n'
        for (const change of changes.filter(obj => obj.change.actions.includes(action))) {
            message += `${trackedChanges[change.change.actions[0]]} ${change.address}\n`
        }
        message += '```\n\n'
    }

    const summary = '<b>Terraform Plan: ' +
        changes.filter(obj => obj.change.actions[0] === "create").length + ' to add, ' +
        changes.filter(obj => obj.change.actions[0] === "update").length + ' to change, ' +
        changes.filter(obj => obj.change.actions[0] === "delete").length + ' to destroy.</b>'

    if(showFileName) {
        const output = `
\`${inputFile}\`
<details><summary>${summary}</summary>
${message}
</details>
`;
    } else {
        const output = `
<details><summary>${summary}</summary>
${message}
</details>`;
    }
    
    return output;
}

try {
    let output = "";

    octokit.log.info(JSON.stringify(inputFilenames))
    inputFilenames.forEach(file => octokit.log.info(file))
    // inputFilenames.forEach(file => output += fileComment(file, inputFilenames.length > 1 ? true : false));

    octokit.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: output
    });

} catch (error) {
    core.setFailed(error.message);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;