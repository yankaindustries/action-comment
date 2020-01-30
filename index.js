const core = require('@actions/core')
const { context, GitHub } = require('@actions/github')
const { map } = require('lodash')


async function run() {
  if (!context.payload.pull_request) {
    core.error('This action is only valid on Pull Requests')
    return
  }

  const token = core.getInput('github-token')
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
  const github = new GitHub(token)

  const comment = core.getInput('comment', { required: true })
  const fn = new AsyncFunction('require', 'github', 'core', 'context', comment)
  const result = await fn(require, github, core, context)

  try {
    const params = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      commit_id: context.payload.after,
      body: result,
    }

    const comment = await github.issues.createComment(params)
    core.setOutput('comment', JSON.stringify(comment))
  } catch(err) {
    core.setFailed(err)
  }
}


run()
