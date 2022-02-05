# Terraform Change Pull Request Commenter Action
This GitHub Action reads changes from your Terraform plan JSON output, summarizes the changes, and posts them in a single GitHub Pull Request comment.

We recommend using this in your Infrastructure as Code delivery workflow to make any change visible and acclerate the PR review process.

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

## Example usage

```yaml
uses: liatrio/terraform-change-pr-commenter@v1.0.0
with:
  json-file: 'my-tfplan.json'
```