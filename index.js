const core = require('@actions/core');
const github = require('@actions/github');
const exp = require('constants');
const fs = require('fs');

const trackedChanges = {
    "delete": "-",
    "create": "+",
    "update": "!"
}

const expandDetailsComment = core.getInput('expand-comment');
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

    let openDetails = ""
    if (expandDetailsComment) {
        openDetails = "open"
    }

    let output = showFileName ? `\`${inputFile}\`` : ""

    output += `
<details ${openDetails}><summary>${summary}</summary>
${message}
</details>

`;

    return output;
}

try {
    const output = inputFilenames.reduce((str, file) => str + fileComment(file, inputFilenames.length > 1), "");

    octokit.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: output
    });

} catch (error) {
    core.setFailed(error.message);
}
