# Profile design record

## Decision (October 2026): "Margin notes"

The profile reads like a student's working notebook: a small hero on ruled paper with a margin line,
then one first-person note per project. Each note opens with a plain status word (`shipped`, `alpha`,
`building`, `built, not verified`, `frozen`, `frozen prototype`, `upstream`) and, where it matters, one
line saying what was checked and what isn't yet. Personality comes from the writing and the two real
screenshots, not from decoration.

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
- Upstream counts are dated text, not a live image, so the numbers can't drift from the words around
  them. The search link always shows the current state.
- MediMind and CodeFlow sit in a collapsed "earlier experiments" fold, on the owner's request.
- The copy is written in Joel's voice, modelled on his own Pipo README. He should edit any line that
  doesn't sound like him.

## Rules for future changes

- Every fact lives in Markdown text. Images may only repeat it.
- Status is a word, never colour or a symbol alone. Statuses must match what each repository says.
- Upstream: always show the whole mix (merged, open, draft, closed), dated. Never count a PR as merged
  unless GitHub says `merged: true`; Hermes Agent #127233 was closed as a duplicate, not merged.
- Text inside images stays at 11px or more on a 358px phone column (font size × 358 ÷ viewBox width).
- Adding a project: one `###` block under "On the desk" with a status word and a source link.

## Files

- `scripts/render_profile_hero.py` writes `assets/profile/hero.{light,dark}.svg`. It is static, so run
  it by hand after changing the name or tagline.
- `.github/workflows/profile-cards.yml` redraws the live cards hourly (unchanged by this redesign apart
  from removing the retired atlas step).
