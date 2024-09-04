# Terraform Change Pull Request Commenter Action
This GitHub Action reads changes from your Terraform plan JSON output, summarizes the changes, and posts them in a single GitHub Pull Request comment.

We recommend using this in your Infrastructure as Code delivery workflow to make any change visible and acclerate the PR review process.

## Why is this GitHub Action different than the other Terraform Plan commenters?

Implementing this Action is _super_ simple and the comments are consise and easy to read. Other implementations may be heavily opinionated or require adding multiple jobs to your workflow.

## Features

- Display changes in a Terraform plan without posting larger sections of the plan change log. This approach will, in most cases, avoid the situation where plan contents are too large for a single PR comment.
- Collapsed as a summary by default, when expanded, the comment is broken up into sections for  deletion, creation, and resource changes. The changes are also color-coded to help draw attention to each proposed modification.
- This JavaScript GitHub Action runs directly on a host runner and executes faster than a Docker container Action.
- Possibility to add the output to your workflow summary.
- Possibility to hide previous comments generated by this action.
- Possibility to not create any comments in case there are no infrastructure changes.
- Customize the header and the footer of the generated output.

### Example Comment
![terraform-changes](./assets/terraform-changes.png)

## Inputs

### `json-file`

**Optional** Defaults to `tfplan.json`

- The location of the JSON file created by running `terraform show -no-color -json tfplan.plan > tfplan.json` (Or whatever you choose to name your plan or json outputs)

- Multiple files can be provided using a text block.

### `github-token`

**Optional** Boolean defaults to `${{github.token}}`

- Used to authenticate with the GitHub API.

### `expand-comment`

**Optional** Boolean defaults to `false`

- Will expand the changes in comments by default rather than having them collapsed beneath the summary

### `include-plan-job-summary`

**Optional** Defaults to `false`

- Will write the plan output to the workflow summary.

- The workflow summary will still be set when running this action outside of a PR context.

### `comment-header`

**Optional** Defaults to `Terraform Plan Changes`

- Will set the header of the PR comment and/or workflow summary.

### `comment-footer`

**Optional** Defaults to `""`

- Will set a footer of the PR comment and/or workflow summary.

### `include-workflow-link`

**Optional** Defaults to `false`

- Will include a link back to the workflow in the PR comment and/or workflow summary.

### `quiet`

**Optional** Defaults to `false`

- Will not create a PR comment when there are no infrastructure changes.

### `hide-previous-comments`

**Optional** Defaults to `false`

- Will hide/minimize all previous comments generated by this action.

### `log-changed-resources`

**Optional** Defaults to `true`

- Logs all the changed resources found in the plan to the action output.

## Example usage

Single plan file:
```yaml
uses: liatrio/terraform-change-pr-commenter@v1.4.0
with:
  json-file: my-tfplan.json
  expand-comment: 'true'
```

Multiple plan files:
```yaml
uses: liatrio/terraform-change-pr-commenter@v1.4.0
with:
  json-file: |
    core-infra-tfplan.json
    shared-infra-tfplan.json
```

Include plan output to the Actions workflow job summary:
```yaml
uses: liatrio/terraform-change-pr-commenter@v1.4.0
with:
  json-file: my-tfplan.json
  expand-comment: 'true'
  include-plan-job-summary: 'true'
```

**Note:**
- When `include-plan-job-summary = true`, if the action is executed in non-Pull Request workflows, the plan output will also be posted to the job summary of that run. If you do not wish to have this behavior, apply conditional logic to your workflow file.

#### Example Job Summary Output
![Plan output job summary](assets/plan-output-job-summary.png)

## Example usage with OpenTofu

To use this action with OpenTofu you need to initialize OpenTofu without the wrapper, like discussed in the `known issues` below.

**You also need to convert the planfile to a JSON planfile using the `tofu show -json` command.**

```yaml
  - uses: opentofu/setup-opentofu@v1
    with:
      tofu_wrapper: false

  - name: Create planfile
    run: tofu plan -no-color -out=./.planfile

  - name: Convert planfile to JSON planfile
    run: tofu show -json ./.planfile >> ./my-planfile.json

  - name: Create PR comment
    uses: liatrio/terraform-change-pr-commenter@v1.4.0
    with:
      json-file: my-planfile.json
```

## Terraform Configuration / Known Issues
#### Known issue when including the [Terraform Wrapper script](https://github.com/hashicorp/setup-terraform#inputs)
- Execution may error with `Error: Unexpected token c in JSON at position 1`
  - **Cause**: Terraform wrapper enabled (default behavior) causes invalid JSON in Terraform output.
  - **Fix**: Exclude the Terraform Wrapper when setting up Terraform (*GitHub Actions example*)
    ```yaml
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
      with:
        terraform_wrapper: false
    ```

## Contributing or Submitting Issues

### Contributions are welcome!
If you'd like to suggest changes, feel free to submit a Pull Request or [open an issue](https://github.com/liatrio/terraform-change-pr-commenter/issues/new).

Otherwise if things aren't working as expected, please [open a new issue](https://github.com/liatrio/terraform-change-pr-commenter/issues/new). Please include code references, a description of the issue, and expected behavior.

---
![CodeQL Security Scan](https://github.com/liatrio/terraform-change-pr-commenter/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)
![Release](https://github.com/liatrio/terraform-change-pr-commenter/actions/workflows/release.yml/badge.svg?branch=main)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
