const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const expandDetailsComment = core.getBooleanInput('expand-comment');
const includePlanSummary = core.getBooleanInput('include-plan-job-summary');
const myToken = core.getInput('github-token');
const octokit = github.getOctokit(myToken);
const context = github.context;
const inputFilenames = core.getMultilineInput('json-file');

const output = () => {
    let body = '';
    // for each file
    for(const file of inputFilenames) {
        const resource_changes = JSON.parse(fs.readFileSync(file)).resource_changes;
        try {
            if(Array.isArray(resource_changes) && resource_changes.length > 0) {
                const resources_to_create   = []
                , resources_to_update   = []
                , resources_to_delete   = []
                , resources_to_replace  = []
                , resources_unchanged   = [];
    
                // for each resource changes
                for(const resource of resource_changes) {
                    const change = resource.change;
                    const address = resource.address;
                    
                    switch(change.actions[0]) {
                        default:
                            break;
                        case "no-op":
                            resources_unchanged.push(address);
                            break;
                        case "create":
                            resources_to_create.push(address);
                            break;
                        case "delete":
                            if(change.actions.length > 1) {
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
\`${file}\`
<details ${expandDetailsComment ? "open" : ""}>
  <summary>
    <b>Terraform Plan: ${resources_to_create.length} to be created, ${resources_to_delete.length} to be deleted, ${resources_to_update.length} to be updated, ${resources_to_replace.length} to be replaced, ${resources_unchanged.length} unchanged.</b>
  </summary>
${details("create", resources_to_create, "+")}
${details("delete", resources_to_delete, "-")}
${details("update", resources_to_update, "!")}
${details("replace", resources_to_replace, "+")}
</details>
`
            } else {
                body += `
\`${file}\`
<p>There were no changes done to the infrastructure.</p>
`
                core.info(`"The content of ${file} did not result in a valid array or the array is empty... Skipping."`)
            }
        } catch (error) {
            core.error(`${file} is not a valid JSON file.`);
        }
    }
    return body;
}

const details = (action, resources, operator) => {
    let str = "";
    
    if(resources.length !== 0) {
        str = `
#### Resources to ${action}\n
\`\`\`diff\n
`;
        for(const el of resources) {
            // In the replace block, we show delete (-) and then create (+)
            if(action === "replace") {
                str += `- ${el}\n`
            }
            str += `${operator} ${el}\n`
        }

        str += "```\n"
    }
    
    return str;
}

try {
    if (includePlanSummary) {
        core.info("Adding plan output to job summary")
        core.summary.addHeading('Terraform Plan Results').addRaw(output()).write()
    }

    if (context.eventName === 'pull_request') {
        core.info(`Found PR # ${context.issue.number} from workflow context - proceeding to comment.`)
    } else {
        core.warning("Action doesn't seem to be running in a PR workflow context.")
        core.warning("Skipping comment creation.")
        process.exit(0);
    }

    octokit.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: output()
    });

} catch (error) {
    core.setFailed(error.message);
}
