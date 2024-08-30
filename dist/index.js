/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 105:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 82:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


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
const core = __nccwpck_require__(105);
const github = __nccwpck_require__(82);
const fs = __nccwpck_require__(147);

const expandDetailsComment = core.getBooleanInput('expand-comment');
const includePlanSummary = core.getBooleanInput('include-plan-job-summary');
const myToken = core.getInput('github-token');
const octokit = github.getOctokit(myToken);
const context = github.context;
const inputFilenames = core.getMultilineInput('json-file');
const commentHeader = core.getMultilineInput('comment-header');
const commentFooter = core.getMultilineInput('comment-footer');
const quietMode = core.getBooleanInput('quiet');
const includeLinkToWorkflow = core.getBooleanInput('include-workflow-link');


const workflowLink = includeLinkToWorkflow ? `
[Workflow: ${context.workflow}](${ context.serverUrl }/${ context.repo.owner }/${ context.repo.repo }/actions/runs/${ context.runId })
` : "";

var hasNoChanges = false;

const output = () => {
    let body = '';
    // for each file
    for (const file of inputFilenames) {
        const resource_changes = JSON.parse(fs.readFileSync(file)).resource_changes;
        try {
            let changed_resources = resource_changes.filter((resource) => {
                return resource.change.actions != ["no-op"];
            })

            console.log("changed_resources", changed_resources)
            if (Array.isArray(resource_changes) && resource_changes.length > 0) {
                const resources_to_create = [],
                    resources_to_update = [],
                    resources_to_delete = [],
                    resources_to_replace = [],
                    resources_unchanged = [];

                // for each resource changes
                for (const resource of resource_changes) {
                    const change = resource.change;
                    const address = resource.address;

                    switch (change.actions[0]) {
                        default:
                            break;
                        case "no-op":
                            resources_unchanged.push(address);
                            break;
                        case "create":
                            resources_to_create.push(address);
                            break;
                        case "delete":
                            if (change.actions.length > 1) {
                                resources_to_replace.push(address);
                            } else {
                                resources_to_delete.push(address);
                            }
                            break;
                        case "update":
                            resources_to_update.push(address);
                            break;
                    }
                }
                // the body must be indented at the start otherwise
                // there will be formatting error when comment is 
                // showed on GitHub
                body += `
${commentHeader}
<details ${expandDetailsComment ? "open" : ""}>
<summary>
<b>Terraform Plan: ${resources_to_create.length} to be created, ${resources_to_delete.length} to be deleted, ${resources_to_update.length} to be updated, ${resources_to_replace.length} to be replaced, ${resources_unchanged.length} unchanged.</b>
</summary>
${details("create", resources_to_create, "+")}
${details("delete", resources_to_delete, "-")}
${details("update", resources_to_update, "!")}
${details("replace", resources_to_replace, "+")}
</details>
${commentFooter.map(a => a == '' ? '\n' : a).join('\n')}
${workflowLink}
`
                if (resources_to_create + resources_to_delete + resources_to_update + resources_to_replace == []) {
                    hasNoChanges = true;
                }
            } else {
                hasNoChanges = true;
                console.log("No changes found in the plan. setting hasNoChanges to true.")
                body += `
<p>There were no changes done to the infrastructure.</p>
`
                core.info(`"The content of ${file} did not result in a valid array or the array is empty... Skipping."`)
            }
        } catch (error) {
            core.error(`${file} is not a valid JSON file. error: ${error}`);
        }
    }
    return body;
}

const details = (action, resources, operator) => {
    let str = "";

    if (resources.length !== 0) {
        str = `
#### Resources to ${action}\n
\`\`\`diff\n
`;
        for (const el of resources) {
            // In the replace block, we show delete (-) and then create (+)
            if (action === "replace") {
                str += `- ${el}\n`
            }
            str += `${operator} ${el}\n`
        }

        str += "```\n"
    }

    return str;
}

try {
    let rawOutput = output();
    
    core.info(`Raw Output: ${rawOutput}`);

    if (includePlanSummary && rawOutput) {
        core.info("Adding plan output to job summary");
        core.summary.addHeading('Terraform Plan Results');
        core.summary.addRaw(rawOutput);
        core.summary.write();
    } else if (includePlanSummary) {
        core.warning("Include plan summary is true, but rawOutput is empty or undefined.");
    }

    if (context.eventName === 'pull_request') {
        core.info(`Found PR # ${context.issue.number} from workflow context - proceeding to comment.`)
    } else {
        core.warning("Action doesn't seem to be running in a PR workflow context.")
        core.warning("Skipping comment creation.")
        process.exit(0);
    }

    console.log("quietMode", quietMode)
    console.log("hasNoChanges", hasNoChanges)
    console.log("quietMode && hasNoChanges", quietMode && hasNoChanges)
    if (quietMode && hasNoChanges) {
        core.info("quiet mode is enabled and there are no changes to the infrastructure.")
        core.info("Skipping comment creation.")
        process.exit(0);
    }

    core.info("Adding comment to PR");
    core.info(`Comment: ${rawOutput}`);

    octokit.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: rawOutput
    });
} catch (error) {
    core.setFailed(error.message);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;