const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const tfplanJsonFile = core.getInput('json-file');

const trackedChanges = {
    "delete": "-",
    "create": "+",
    "update": "!"
}

const changes = JSON.parse(fs.readFileSync(tfplanJsonFile)).resource_changes;

try {
    let message = "";

    for (const action in trackedChanges){
    if(changes.filter(obj => obj.change.actions.includes(action)).length === 0){
        continue
    }
    message += '#### Resources to ${action}: \n'
    for (const change of changes.filter(obj => obj.change.actions.includes(action))){
        message += `${trackedChanges[change.change.actions[0]]} ${change.address}\n`
    }
    message += '\n'
    }

    const summary = 'Plan: ' +
    changes.filter(obj => obj.change.actions[0] === "create").length + ' to add, ' +
    changes.filter(obj => obj.change.actions[0] === "update").length + ' to change, ' + 
    changes.filter(obj => obj.change.actions[0] === "delete").length + ' to destroy.'

    const output = `
#### Terraform Plan 
<details><summary>${summary}</summary>

\`\`\`diff
${message}
\`\`\`
</details>`;
    const myToken = core.getInput('github-token');
    const octokit = github.getOctokit(myToken);

    const context = github.context;

    octokit.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: output
    });

} catch (error) {
    core.setFailed(error.message);
}