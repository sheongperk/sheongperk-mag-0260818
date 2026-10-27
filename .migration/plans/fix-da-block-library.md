# Plan: Fix the Block Library in Document Authoring

## Problem
Your blocks don't appear in the Library panel when authors edit pages in Document Authoring (da.live).

## Likely cause
- The project is recorded as a **Universal Editor (xwalk)** project, but you author in **Document Authoring**. So the library setup was done the Universal Editor way, with component models, and nothing was set up for DA.
- The block library link points to a **generic boilerplate library** (`sta-xwalk-boilerplate`), not this site's own. Even if DA could read it, it wouldn't list this site's 21 blocks (including the custom ones: `hero-experience`, `columns-feature`, `tabs-promo`, `teaser`, `quote`).
- There are probably no sample block pages in DA for the Library panel to show. I couldn't confirm this yet because plan mode only allows limited checks.

## Your decisions
- **Authoring:** Document Authoring (da.live)
- **Block library add-on:** turn it on

## Approach
1. Turn on the block library add-on. This needs Execute mode and only changes the project's settings file.
2. Change the project type from Universal Editor to Document Authoring, and replace the boilerplate library link with this site's own library.
3. Use the add-on to create a sample page for each block and its variants, so authors see realistic examples in the Library panel.
4. Upload the sample pages to Document Authoring and connect the Library panel to them. Each sample page is first saved in the local workspace, so the local copy and DA match.
5. Check the result in the preview and in da.live.

## Checklist
- [ ] Switch to Execute mode (required before any changes)
- [ ] Turn on the block library add-on in the project settings, then wait for your next message so it loads
- [ ] Confirm the current state: project type, library link, which blocks exist, and any existing library pages
- [ ] Change the project type to Document Authoring and point the library at this site (org `sheongperk`, site `sheongperk-mag-0260818`)
- [ ] Create sample library pages for all 21 blocks and their variants
- [ ] Check each sample page in the preview
- [ ] **Ask you to confirm** before uploading anything to Document Authoring
- [ ] Upload the sample pages and the library list to Document Authoring
- [ ] Connect the Library panel to the site's library list
- [ ] Check in da.live that the Library panel shows the blocks
- [ ] Tell you exactly what changed where: local workspace, Document Authoring, and EDS preview/live (no publishing unless you ask)

## Notes
- Uploading to Document Authoring publishes content outside the workspace, so I'll ask you to confirm first.
- If an upload is refused, the Adobe credentials permission is off. You'd enable it under Settings → LLM Permissions. Never paste a token into the chat.
- The Universal Editor component files can stay where they are. They don't affect Document Authoring.
