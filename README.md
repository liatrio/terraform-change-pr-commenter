# Terraform Change Pull Request Commenter Action
This GitHub Action reads changes from your Terraform plan JSON output, summarizes the changes, and posts them in a single GitHub Pull Request comment.

We recommend using this in your Infrastructure as Code delivery workflow to make any change visible and acclerate the PR review process.

## Why is this GitHub Action different than the other Terraform Plan commenters?

Implementing this Action is _super_ simple and the comments are consise and easy to read. Other implementations may be heavily opinionated or require adding multiple jobs to your workflow.

## Features

- Display changes in a Terraform plan without posting larger sections of the plan change log. This approach will, in most cases, avoid the situation where plan contents are too large for a single PR comment. 
- Collapsed as a summary by default, when expanded, the comment is broken up into sections for  deletion, creation, and resource changes. The changes are also color-coded to help draw attention to each proposed modification.
- This JavaScript GitHub Action runs directly on a host runner and executes faster than a Docker container Action.

### Example Comment
![terraform-changes](./assets/terraform-changes.png)

## Inputs

### `json-file`

**Optional** Defaults to `tfplan.json`

The location of the JSON file created by running `terraform show -no-color -json tfplan.plan > tfplan.json` (Or whatever you choose to name your plan or json outputs)

Multiple files can be provided using a text block.

## Example usage
Single plan file:
```yaml
uses: liatrio/terraform-change-pr-commenter@v1.0.3
with:
  json-file: my-tfplan.json
```
Multiple plan files:
```yaml
uses: liatrio/terraform-change-pr-commenter@v1.0.3
with:
  json-file: |
    core-infra-tfplan.json
    shared-infra-tfplan.json
```

## Contributing or Submitting Issues

### Contributions are welcome!
If you'd like to suggest changes, feel free to submit a Pull Request or [open an issue](https://github.com/liatrio/terraform-change-pr-commenter/issues/new).

Otherwise if things aren't working as expected, please [open a new issue](https://github.com/liatrio/terraform-change-pr-commenter/issues/new). Pleae include code references, a description of the issue, and expected behavior.

--- 
![CodeQL Security Scan](https://github.com/liatrio/terraform-change-pr-commenter/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)
![Release](https://github.com/liatrio/terraform-change-pr-commenter/actions/workflows/release.yml/badge.svg?branch=main)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
