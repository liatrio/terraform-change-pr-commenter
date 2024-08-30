const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

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

const minimizeComments = (octokit, text) => {
    const query = `
    query($owner: String!, $repo: String!, $prNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $prNumber) {
          comments(first: 100) {
            nodes {
              id
              body
            }
          }
        }
      }
    }`;

    // Fetch all comments
    const { repository } = octokit.graphql(query, {
        owner: context.repo.owner,
        repo: context.repo.repo,
        prNumber: context.issue.number
    });

    repository.pullRequest.comments.nodes
        .filter(comment => comment.body.includes(text))
        .forEach(comment => {
            const minimizeQuery = `
            mutation minimizeComment($id: ID!) {
              minimizeComment(input: { classifier: OUTDATED, subjectId: $id }) {
                clientMutationId
              }
            }`;

            // Minimize each filtered comment
            octokit.graphql(minimizeQuery, { id: comment.id });
        });
}

try {
    let rawOutput = output();
    let createComment = true;

    if (includePlanSummary) {
        core.info("Adding plan output to job summary")
        core.summary.addHeading('Terraform Plan Results').addRaw(rawOutput).write()
    }

    if (context.eventName === 'pull_request') {
        core.info(`Found PR # ${context.issue.number} from workflow context - proceeding to comment.`)
        
    } else {
        core.info("Action doesn't seem to be running in a PR workflow context.")
        core.info("Skipping comment creation.")
        createComment = false
    }

    console.log("quietMode", quietMode)
    console.log("hasNoChanges", hasNoChanges)
    console.log("quietMode && hasNoChanges", quietMode && hasNoChanges)
    if (quietMode && hasNoChanges) {
        core.info("quiet mode is enabled and there are no changes to the infrastructure.")
        core.info("Skipping comment creation.")
        createComment = false
    }

    if (createComment){
        minimizeComments(octokit, 'Terraform Plan:');
    }

    if (createComment){
        core.info("Adding comment to PR");
        core.info(`Comment: ${rawOutput}`);
        octokit.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: rawOutput
        });
        core.info("Comment added successfully.");
    }
    
} catch (error) {
    core.setFailed(error.message);
}
