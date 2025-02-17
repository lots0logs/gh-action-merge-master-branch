const { Toolkit } = require('actions-toolkit');

// Allow for another token
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.PA_TOKEN;

Toolkit.run(
  async tools => {
    const { branchRegex, force = false, skipProtected = false } = tools.arguments

    if (!branchRegex) {
      return tools.exit.failure(
        'A branch regex arg is required (i.e: --branch-regex staging)',
      );
    }
    
    const gh    = tools.github;
    const regex = new RegExp(branchRegex);
    const ref   = tools.context.ref;
    
    const { owner, repo } = tools.context.repo.split('/');
    const branches        = gh.repos.listBranches.endpoint.merge({ owner, repo });
    
    for await (const { data: branch } of gh.paginate(branches)) {
      if (! regex.test(branch)) {
        continue;
      }
      
      const base = branch;
      const head = 'master';
      
      await gh.repos.merge({ owner, repo, base, head });
    }

    if (ref.startsWith('tags/')) {
      const {
        data: heads,
      } = await tools.github.repos.listBranchesForHeadCommit({
        ...tools.context.repo,
        commit_sha: tools.context.sha,
      });

      if (!heads.length) {
        return tools.exit.neutral('Tag isn\'t head of any branches');
      }

      if (!skipProtected && !heads.find(value => value.protected)) {
        return tools.exit.neutral(
          'A tag was pushed but isn\'t head of a protected branch, skipping',
        );
      }
    }

    await tools.github.git.updateRef({
      ...tools.context.repo,
      sha: tools.context.sha,
      ref: `heads/${branch}`,
      force,
    });
  },
  { event: ['push', 'release'] },
);
