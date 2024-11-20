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
const hidePreviousComments = core.getBooleanInput('hide-previous-comments');
const logChangedResources = core.getBooleanInput('log-changed-resources');

const workflowLink = includeLinkToWorkflow ? `
[Workflow: ${context.workflow}](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId })
` : "";

var hasNoChanges = false;

// GraphQL queries and mutations used for hiding previous comments
const minimizeCommentQuery = /* GraphQL */ `
  mutation minimizeComment($id: ID!) {
    minimizeComment(input: { classifier: OUTDATED, subjectId: $id }) {
      clientMutationId
    }
  }
`;

const commentsQuery = /* GraphQL */ `
  query comments($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        comments(last: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            id
            body
            isMinimized
          }
        }
      }
    }
  }
`;

const output = () => {
  let body = '';
  // for each file
  for (const file of inputFilenames) {
    const resource_changes = JSON.parse(fs.readFileSync(file)).resource_changes;
    try {
      let changed_resources = resource_changes.filter((resource) => {
        return resource.change.actions != ["no-op"];
      })

      if (logChangedResources) {
        console.log("changed_resources", changed_resources)
      }
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

const queryComments = (variables) => {
    return octokit.graphql(commentsQuery, variables);
};

const minimizeComment = (variables) => {
    return octokit.graphql(minimizeCommentQuery, variables);
};

const hideComments = () => {
    core.info(`Hiding previous comments.`);

    queryComments({
      owner: context.repo.owner,
      name: context.repo.repo,
      number: context.issue.number
    })
      .then(response => {
        core.info(`Successfully retrieved comments for PR #${context.issue.number}.`);
        const comments = response.repository.pullRequest.comments.nodes;

        core.info(`Found ${comments.length} comments in the PR.`);

        const filteredComments = comments.filter(comment =>
          comment.body.includes('Terraform Plan:') ||
          comment.body.includes('There were no changes done to the infrastructure.')
        );

        core.info(`Filtered down to ${filteredComments.length} comments that need to be minimized.`);

        const minimizePromises = filteredComments
          .filter(comment => !comment.isMinimized)
          .map(comment => {
            return minimizeComment({ id: comment.id })
              .catch(error => core.error(`Failed to minimize comment ${comment.id}: ${error.message}`));
          });

        return Promise.all(minimizePromises)
          .then(() => core.info('All minimize operations completed.'))
          .catch(error => core.error(`Error during minimize operations: ${error.message}`));
      })
      .catch(error => core.error(`Failed to retrieve comments: ${error.message}`));
};


try {
    let rawOutput = output();
    let createComment = true;

    console.log("hidePreviousComments", hidePreviousComments)
    console.log("hidePreviousComments && context.eventName === pull_request", hidePreviousComments && context.eventName === 'pull_request')
    if (hidePreviousComments && context.eventName === 'pull_request') {
      hideComments();
    }

    console.log("includePlanSummary", includePlanSummary)
    if (includePlanSummary) {
      core.info("Adding plan output to job summary")
      core.summary.addHeading('Terraform Plan Results').addRaw(rawOutput).write()
    }

    console.log("quietMode", quietMode)
    console.log("hasNoChanges", hasNoChanges)
    console.log("quietMode && hasNoChanges", quietMode && hasNoChanges)
    if (quietMode && hasNoChanges) {
      core.info("quiet mode is enabled and there are no changes to the infrastructure.")
      core.info("Skipping comment creation.")
      createComment = false
    }

    if (context.eventName === 'pull_request' || context.eventName === 'workflow_call') {
      core.info(`Found PR # ${context.issue.number} from workflow context - proceeding to comment.`)
    } else {
      core.info("Action doesn't seem to be running in a PR workflow context.")
      core.info("Skipping comment creation.")
      createComment = false
    }

    if (createComment) {
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
