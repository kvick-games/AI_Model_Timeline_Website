# AI News Maintenance Automation

You are maintaining the AI Model Release Timeline website in this repository.

Run this automation twice per day, around 10:00 AM and 4:00 PM America/Los_Angeles. Prefer running it as a Codex project automation in a dedicated background worktree so unfinished local edits are not touched.

## Objective

Check for major AI model releases, model-family updates, high-signal product launches, research releases, coding-agent releases, creative-model launches, robotics/autonomy milestones, and significant AI industry events that should be added to the timeline.

Prepare a pull request only when there is a source-backed update worth adding.

## Research Rules

- Search current web sources every run.
- Prefer official sources: company blogs, release notes, docs, model cards, GitHub/Hugging Face pages, papers, regulatory releases, or company announcements.
- Use credible reporting only as secondary confirmation.
- Do not add rumors, speculative future releases, routine pricing-only changes, minor patches, benchmark-only noise, or weak blog/news churn.
- If a major update needs a new company, product line, event type, class, preset, logo, or visual asset, make the smallest coherent schema/data change needed instead of forcing it into the wrong existing lane.
- Do not duplicate existing timeline items or article slugs.

## Implementation Rules

1. Inspect the current timeline data before making changes:
   - `src/data/timeline.ts`
   - `src/data/companyProfiles.ts`
   - `src/data/types.ts`
   - `src/data/articles/*.ts`
2. For each accepted update, add or update the relevant release in `src/data/timeline.ts`.
3. For important updates, add a matching article file under `src/data/articles/`.
4. Match the existing article style:
   - compact factual prose
   - source links in `sources`
   - useful `facts`
   - sections such as `What changed`, `How it ships`, and `Why it mattered`
5. Use existing IDs, classes, presets, event types, tags, and logo marks where they fit.
6. Keep changes tightly scoped to timeline maintenance.

## Verification

Before preparing a PR, run:

```bash
npm run lint
npm run build
```

If there are no content changes, report that no update cleared the bar and do not create a PR.

If there are content changes, create a branch, commit the changes, push it, and open a draft PR. The PR body should include:

- the updates added
- the sources used
- why each update cleared the significance bar
- verification commands and results

## Safety

- Do not overwrite unrelated local changes.
- If the worktree is dirty before you start, separate your changes onto a new branch or worktree.
- If source evidence is ambiguous, leave a note instead of adding the item.
