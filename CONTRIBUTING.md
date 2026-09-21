# Contributing

Thanks for helping improve this profile repository.

This repository contains the GitHub profile README, generated activity artifacts, and supporting documentation. Contributions should keep the profile accurate, reproducible, and low-noise.

## What to contribute

Useful contributions include:

- correcting inaccurate project or contribution information
- fixing broken links or badges
- improving documentation and portfolio clarity
- improving the GitHub Actions that generate activity artifacts
- adding evidence-backed engineering information
- fixing reproducibility or presentation issues

Please avoid changes whose primary purpose is to inflate contribution counts, stars, activity, or other metrics.

## Workflow

1. Fork the repository if you are contributing from outside the repository.
2. Create a focused branch, for example: feature/update-profile
3. Make the smallest change that solves the problem.
4. Verify links, generated artifacts, and relevant workflows when applicable.
5. Use a clear commit message.
6. Open a pull request describing what changed and why.

## Profile accuracy

Portfolio claims should be backed by public repository state, releases, tests, CI, benchmarks, or other inspectable evidence.

Do not add fabricated:

- stars or follower counts
- users or adoption numbers
- test results
- performance claims
- merged contribution counts
- project capabilities

If a metric is generated automatically, prefer the repository's existing GitHub Actions workflow over manually editing the displayed value.

## Generated assets

The assets/profile directory contains generated activity artifacts. If changing their generation logic, update the workflow or source that produces them rather than editing generated output by hand unless the change is specifically a generated-artifact correction.

## Pull requests

A good PR should:

- have a focused scope
- explain the problem and solution
- avoid unrelated formatting churn
- include validation performed
- preserve the factual nature of the profile

For documentation-only changes, validation should at minimum include checking affected Markdown structure and links where practical.

## License

By contributing, you agree that your contributions will be licensed under the repository's existing license.
