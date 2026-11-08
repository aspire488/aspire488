# Portfolio data

The project rows and the open-source section on the homepage are rendered at build time from the JSON
files in this folder. Nothing is fetched in the visitor's browser.

| File | Who writes it | What it is |
| --- | --- | --- |
| `projects.config.json` | you | editorial control over projects |
| `contributions.config.json` | you | the three featured open-source contributions |
| `projects.json` | the workflow | generated, do not edit |
| `contributions.json` | the workflow | generated, do not edit |

`.github/workflows/portfolio-data.yml` runs daily (and on demand from the Actions tab). It discovers
repositories and pull requests, validates them, commits the JSON only when something changed, and then
starts the Pages deploy. If GitHub is down or validation fails, the run goes red and the last good data
stays live.

## Projects: `projects.config.json`

- `exclude`: repository names that never appear. Always wins.
- `featured`: the large rows, in this order. Automation never adds, removes or reorders these.
- `pinned`: compact rows shown first, in this order, whatever their state.
- `archive`: force a repository to archived (it drops off the page).
- `overrides.<repo>`: `title`, `what`, `stack`, `status`, `page`, `demo`, `visual`, `links`.
  The hand-written `status` line is the voice of the site; keep it honest.

Any other original (non-fork) repository appears automatically in the compact list once it is
**shipped**:

1. **Identity:** it has a GitHub description and a README of at least 600 bytes.
2. **Implementation:** it has at least 20 kB of source and at least 10 human commits.
3. **A shipping signal for its type:**
   - web: a homepage or GitHub Pages URL that responds;
   - Android or desktop app: a release with a downloadable asset;
   - library or tool: a release or a version tag.

Repositories that are not yet there are tracked as discovered or developing in `projects.json` but are
not shown. To feature one anyway, add it to `featured` or `pinned`.

## Open source: `contributions.config.json`

Each entry names a repository, the PR numbers to highlight and a short note. A listed PR is shown only
while GitHub reports it as merged. The counts line (merged, open, draft, closed without merging) and
the link to [OSS Atlas](https://github.com/aspire488/oss-atlas) are generated.

## Run it locally

```sh
cd site/off-register
GITHUB_TOKEN=$(gh auth token) npm run data
npm test
npm run build
```
