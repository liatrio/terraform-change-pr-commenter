const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");

const expandDetailsComment = core.getBooleanInput("expand-comment");
const includePlanSummary = core.getBooleanInput("include-plan-job-summary");
const myToken = core.getInput("github-token");
const octokit = github.getOctokit(myToken);
const context = github.context;
const inputFilenames = core.getMultilineInput("json-file");
const commentHeader = core.getMultilineInput("comment-header");
const commentFooter = core.getMultilineInput("comment-footer");
const quietMode = core.getBooleanInput("quiet");
const includeLinkToWorkflow = core.getBooleanInput("include-workflow-link");
const includeLinkToJob = core.getBooleanInput("include-job-link");
const hidePreviousComments = core.getBooleanInput("hide-previous-comments");
const logChangedResources = core.getBooleanInput("log-changed-resources");
const includeTagOnlyResources = core.getBooleanInput(
  "include-tag-only-resources",
);
const includeUnchangedResources = core.getBooleanInput(
  "include-unchanged-resources",
);

const MAX_COMMENT_LENGTH = 65536;

// Get current job name from GitHub environment variable
const currentJobName = process.env.GITHUB_JOB || "";
const currentRunnerName = process.env.RUNNER_NAME || "";

// Log the job name for debugging
console.log("Current job name:", currentJobName);

const workflowLink = includeLinkToWorkflow
  ? `
[Workflow: ${context.workflow}](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})
`
  : "";

// Initialize job link as empty string
let jobLink = "";

// Function to get job ID from GitHub API
async function getJobId() {
  if (includeLinkToJob) {
    try {
      // Get all jobs for the current workflow run
      const response = await octokit.rest.actions.listJobsForWorkflowRun({
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: context.runId,
      });

      // Find the current job by name
      const job = response.data.jobs.find(
        (job) =>
          job.runner_name === currentRunnerName &&
          (job.name.endsWith(currentJobName) ||
            job.name.startsWith(currentJobName)),
      );

      if (job) {
        console.log(`Found job ID: ${job.id} for job name: ${job.name}`);
        // Create job link with the numeric job ID
        return `
[Job: ${job.name}](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}/job/${job.id})
`;
      } else {
        console.log(`Could not find job with name: ${currentJobName}`);
        console.log(`Jobs: \n${JSON.stringify(response.data.jobs, null, 2)}`);
        return "";
      }
    } catch (error) {
      console.error(`Error fetching job ID: ${error.message}`);
      return "";
    }
  }
  return "";
}

var hasNoChanges = true;

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
  let body = "";
  // for each file
  for (const file of inputFilenames) {
    let fileHasNoChanges = true;
    const resource_changes =
      JSON.parse(fs.readFileSync(file)).resource_changes || [];
    try {
      let changed_resources = resource_changes.filter((resource) => {
        return resource.change.actions != ["no-op"];
      });

      if (logChangedResources) {
        console.log("changed_resources", changed_resources);
      }
      if (Array.isArray(resource_changes) && resource_changes.length > 0) {
        const resources_to_create = [],
          resources_to_update = [],
          resources_to_delete = [],
          resources_to_replace = [],
          resources_to_tag = [],
          resources_unchanged = [];

        // Deep comparison function to check if objects are identical after removing tags
        const isTagOnlyChange = (before, after) => {
          if (includeTagOnlyResources == false) {
            return false;
          }
          const beforeCopy = JSON.parse(JSON.stringify(before || {}));
          const afterCopy = JSON.parse(JSON.stringify(after || {}));

          delete beforeCopy.tags;
          delete beforeCopy.tags_all;
          delete afterCopy.tags;
          delete afterCopy.tags_all;

          return JSON.stringify(beforeCopy) === JSON.stringify(afterCopy);
        };

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
              hasNoChanges = false;
              fileHasNoChanges = false;
              break;
            case "delete":
              if (change.actions.length > 1) {
                resources_to_replace.push(address);
              } else {
                resources_to_delete.push(address);
              }
              hasNoChanges = false;
              fileHasNoChanges = false;
              break;
            case "update":
              if (isTagOnlyChange(change.before, change.after)) {
                resources_to_tag.push(address);
              } else {
                resources_to_update.push(address);
              }
              hasNoChanges = false;
              fileHasNoChanges = false;
              break;
          }
        }
        // the body must be indented at the start otherwise
        // there will be formatting error when comment is
        // showed on GitHub
        let planSummary = `<b>Terraform Plan: ${resources_to_create.length} to be created, ${resources_to_delete.length} to be deleted, ${resources_to_update.length} to be updated${includeTagOnlyResources ? `, ${resources_to_tag.length} to be tagged` : ""}, ${resources_to_replace.length} to be replaced, ${resources_unchanged.length} unchanged.</b>`;

        let fullBody = `
${commentHeader} for \`${file}\`
<details ${expandDetailsComment ? "open" : ""}>
<summary>
${planSummary}
</summary>
${includeUnchangedResources ? details("unchanged", resources_unchanged, "•") : ""}
${details("create", resources_to_create, "+")}
${details("delete", resources_to_delete, "-")}
${details("update", resources_to_update, "!")}
${includeTagOnlyResources ? details("tag", resources_to_tag, "!") : ""}
${details("replace", resources_to_replace, "+")}
</details>
${commentFooter.map((a) => (a == "" ? "\n" : a)).join("\n")}
${workflowLink}
${jobLink}
`;

        if (fullBody.length > MAX_COMMENT_LENGTH) {
          body += `
${commentHeader} for \`${file}\`
${planSummary}
<p>Sorry, the detailed plan exceeded GitHub's comment size limit (${MAX_COMMENT_LENGTH} characters) and has been truncated. Please see the workflow run for the full plan output.</p>
${commentFooter.map((a) => (a == "" ? "\n" : a)).join("\n")}
${workflowLink}
${jobLink}
`;
        } else {
          if (quietMode && fileHasNoChanges) {
            console.log(`Quiet Mode: ${file} has no changes, skipping output to comment`);
          } else {
            body += fullBody;
          }
        }
      } else {
        body += `
<p>There were no changes planned to the infrastructure.</p>
`;
        core.info(
          `"The content of ${file} did not result in a valid array or the array is empty... Skipping."`,
        );
      }
    } catch (error) {
      core.error(`${file} is not a valid JSON file. error: ${error}`);
    }
  }
  return body;
};

const details = (action, resources, operator) => {
  let str_title = "";
  let str = "";

  if (resources.length !== 0) {
    if (action === "unchanged") {
      str_title = "Unchanged resources";
    } else {
      str_title = `Resources to ${action}`;
    }
    str = `
#### ${str_title}\n
\`\`\`diff\n
`;
    for (const el of resources) {
      // In the replace block, we show delete (-) and then create (+)
      if (action === "replace") {
        str += `- ${el}\n`;
      }
      str += `${operator} ${el}\n`;
    }

    str += "```\n";
  }

  return str;
};

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
    number: context.issue.number,
  })
    .then((response) => {
      core.info(
        `Successfully retrieved comments for PR #${context.issue.number}.`,
      );
      const comments = response.repository.pullRequest.comments.nodes;

      core.info(`Found ${comments.length} comments in the PR.`);

      core.info(`Comment header used for matching is: ${commentHeader}`);

      filteredComments = comments.filter(
        (comment) =>
          comment.body.includes("Terraform Plan:") ||
          comment.body.includes(
            "There were no changes done to the infrastructure.",
          ),
      );

      core.info(
        `Filtered down to ${filteredComments.length} comments created by this action.`,
      );

      filteredComments = filteredComments.filter((comment) =>
        comment.body.includes(commentHeader),
      );

      core.info(
        `Filtered down to ${filteredComments.length} comments created by this action.`,
      );

      filteredComments = filteredComments.filter((comment) =>
        comment.body.includes(commentHeader),
      );

      core.info(
        `Filtered down to ${filteredComments.length} comments that need to be minimized.`,
      );

      const minimizePromises = filteredComments
        .filter((comment) => !comment.isMinimized)
        .map((comment) => {
          return minimizeComment({ id: comment.id }).catch((error) =>
            core.error(
              `Failed to minimize comment ${comment.id}: ${error.message}`,
            ),
          );
        });

      return Promise.all(minimizePromises)
        .then(() => core.info("All minimize operations completed."))
        .catch((error) =>
          core.error(`Error during minimize operations: ${error.message}`),
        );
    })
    .catch((error) =>
      core.error(`Failed to retrieve comments: ${error.message}`),
    );
};

// Main execution wrapped in an async function to allow for await
async function run() {
  try {
    // Get job link if needed
    if (includeLinkToJob) {
      jobLink = await getJobId();
      console.log("Job link generated:", jobLink);
    }

    let rawOutput = output();
    let createComment = true;

    console.log("hidePreviousComments", hidePreviousComments);
    console.log(
      "hidePreviousComments && context.eventName === pull_request",
      hidePreviousComments && (context.eventName === "pull_request" || context.eventName === "pull_request_target"),
    );
    if (hidePreviousComments && (context.eventName === "pull_request" || context.eventName === "pull_request_target")) {
      hideComments();
    }

    console.log("includePlanSummary", includePlanSummary);
    if (includePlanSummary) {
      core.info("Adding plan output to job summary");
      core.summary
        .addHeading("Terraform Plan Results")
        .addRaw(rawOutput)
        .write();
    }

    console.log("quietMode", quietMode);
    console.log("hasNoChanges", hasNoChanges);
    console.log("quietMode && hasNoChanges", quietMode && hasNoChanges);
    if (quietMode && hasNoChanges) {
      core.info(
        "quiet mode is enabled and there are no changes to the infrastructure.",
      );
      core.info("Skipping comment creation.");
      createComment = false;
    }

    if (
      context.eventName === "pull_request" ||
      context.eventName === "pull_request_target" ||
      context.eventName === "workflow_call"
    ) {
      // Verify we have PR context available in the case that it's a workflow_call event- should always pass for pull_request
      if (context.issue && context.issue.number) {
        core.info(
          `Found PR # ${context.issue.number} from ${context.eventName} event - proceeding to comment.`,
        );
      } else {
        core.info(
          `${context.eventName} event detected but no PR context available.`,
        );
        core.info("Skipping comment creation.");
        createComment = false;
      }
    } else {
      core.info("Action doesn't seem to be running in a PR workflow context.");
      core.info("Skipping comment creation.");
      createComment = false;
    }

    if (createComment) {
      core.info("Adding comment to PR");
      core.info(`Comment: ${rawOutput}`);
      octokit.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: rawOutput,
      });
      core.info("Comment added successfully.");
    }
    core.setOutput("comment-body", rawOutput);
  } catch (error) {
    core.setFailed(error.message);
  }
}

// Execute the main function
run();
