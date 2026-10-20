# Profile design record

## Decision (October 2026): "Margin notes"

The profile reads like a student's working notebook, and the pictures do the talking. Each project is a
page of ruled exercise-book paper with a red margin line: a sketch of how it works (KIO's gate
checklist, UEA's routing flow, AURA's memory layers, the RAG Platform's foundation-first building,
gh-ops' job board, Pipo's loop) with a crooked rubber stamp for its status (`SHIPPED`, `BUILDING`,
`ALPHA`, `BUILT · NOT VERIFIED`, `FROZEN`).
Upstream work is a page of tally marks. Under each page sits one short, lively caption with links.

Revised after the owner's feedback on the first "Margin notes" build ("too plain and short", "I'm a
student, still learning", "the visuals should speak, not the text"): the text shrank to captions, the
sketches were added, and the Pipo web-room screenshot was removed because it isn't the actual app.

It replaces the "Field Atlas" (a generated route map of projects, retired on purpose: it needed a legend
to read, its labels were too small on phones, and it was a dated monument rather than something that
grows).

## How it was chosen

Seven independent reviewers (creative direction, visual design, identity and voice, facts,
accessibility and mobile, a skeptic, and GitHub implementation) worked in two rounds. Three directions
were built and critiqued:

| Direction | Idea | Outcome |
| --- | --- | --- |
| The Shop Wall | Projects hang on a pegboard with inspection tags | Rejected as images: tag text fell to about 9px on phones, manila tags vanished on the light theme, too many images. Kept as text: the "checked / not yet" line. |
| The Issue | The profile as a small magazine: cover, numbered spreads | Rejected as a frame: issue numbers and spreads were decoration that promised re-issues. Kept: the serif hero type and the italic accent on "hold up." |
| The Desk | First-person notes in Joel's own voice, plain status words | Chosen as the spine. All three design leads independently recommended it. |

Trade-offs settled:

- The tagline "Build things. Make them hold up." stays, but under the name, not as a poster headline.
- Upstream counts live in the tally page, recounted from the GitHub API every run, and the search link
  always shows the current state.
- MediMind and CodeFlow sit in a collapsed "earlier experiments" fold, on the owner's request.
- The copy is written in Joel's voice, modelled on his own Pipo README. He should edit any line that
  doesn't sound like him.
- Every fact on a page is repeated in its alt text and caption, so nothing lives only in a picture.

## Rules for future changes

- Every fact on a page is also in its alt text, and every status word is also in its caption.
- Status is a word, never colour or a symbol alone. Statuses must match what each repository says.
- Upstream: always show the whole mix (merged, open, draft, closed), dated. Never count a PR as merged
  unless GitHub says `merged: true`; Hermes Agent #127233 was closed as a duplicate, not merged.
- Text inside images stays at 11px or more on a 358px phone column (font size × 358 ÷ viewBox width).
- Adding a project: one drawing function in `scripts/render_profile_notebook.py`, one `<picture>` and a
  one-line caption in the README.

## Files

- `scripts/render_profile_notebook.py` writes the hero and the notebook pages
  (`assets/profile/{hero,pipo,kio,uea,aura,rag,ghops,tally}.{light,dark}.svg`). The project pages are
  static; run it by hand after changing a fact. The tally page is live: with `GITHUB_TOKEN` set (as in
  the workflow) it recounts upstream pull requests from the GitHub API every run.
- The pages animate once on load (stamps, ticks, arrows, boxes; Pipo's loop keeps flowing). The
  finished drawing is the resting state, and all motion stops under `prefers-reduced-motion`.
- `.github/workflows/profile-cards.yml` redraws the live cards and the tally, scheduled twice an hour
  because GitHub delays and drops scheduled runs.
