# terraform-change-pr-commenter
GitHub Action to read changes from Terraform plan JSON, summarize changes, and post them in a GitHub Pull Request Comment

## Inputs

### `json-file`

**Optional** Defaults to `tfplan.json`

The location of the JSON file created by running `terraform show -no-color -json tfplan.plan > tfplan.json` (Or whatever you choose to name your plan or json outputs)

## Example usage

```yaml
uses: liatrio/terraform-change-pr-commenter@main
with:
  json-file: 'my-tfplan.json'
```