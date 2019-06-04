# GitHub Action - Merge Master Branch

Automaically merges latest commits from master branch into feature branches.

## Usage
```workflow
workflow "Update Feature Branches" {
  on = "push"
  resolves = ["Update branch"]
}

action "Is Master Branch" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Update Feature Branches" {
  needs = "Is Master Branch"
  uses = "lots0logs/gh-action-merge-master-branch@master"
  args = "--branch-regex ^\d+-\w+"
  secrets = ["PA_TOKEN"]
}
```

You could also run this after a release is published (see [tags](#tags)):

```workflow
workflow "Update Feature Branches" {
  on = "release"
  resolves = ["Update branch"]
}

action "Is Master Tag" {
  uses = "actions/bin/filter@master"
  args = "tag [0-9]*"
}

action "Update Feature Branches" {
  needs = "Is Master Tag"
  uses = "lots0logs/gh-action-merge-master-branch@master"
  args = "--branch-regex ^\d+-\w+"
  secrets = ["PA_TOKEN"]
}
```

## Github Token

Because the `GITHUB_TOKEN` will not trigger another workflow, the action allows another secret
`PA_TOKEN` to be used (only if `GITHUB_TOKEN` is not provided).

You can generate a Personal Access Token [here](https://github.com/settings/tokens).

## Tags

When a tag is pushed, the action will check if the tag is the HEAD of a protected branch.
It uses the [Github API](https://developer.github.com/v3/repos/commits/#list-branches-for-head-commit).
It could fail if a commit was pushed before the action is started.

## Options

- `branch-regex`: Regex pattern used to determine which branches to update. (**required**).
- `skipProtected`: For tags, don't check for protected branch.
- `force`: Indicates whether to force the update or to make sure the update is a fast-forward
  update. Leaving this out or setting it to `false` will make sure you're not overwriting work.

> To filter the source branch or tags, use
> [filter action](https://github.com/actions/bin/tree/master/filter).
