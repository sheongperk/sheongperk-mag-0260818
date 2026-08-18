# Malaysia Airlines Page Migration Plan

## Objective
Migrate the page **"Elevating Your Journey"** (`https://www.malaysiaairlines.com/sg/en/experience/malaysian-hospitality/elevating-your-journey.html`) into this AEM Edge Delivery Services project as authorable content, matching the original's structure and design as closely as the available block palette allows.

## Source
- **URL:** `https://www.malaysiaairlines.com/sg/en/experience/malaysian-hospitality/elevating-your-journey.html`
- **Target project:** `sheongperk/sheongperk-mag-0260818` (Document Authoring content source: `https://content.da.live/sheongperk/sheongperk-mag-0260818/`)
- **Migration type:** Single-page migration

## Approach
This is a single-page migration, so I'll drive it through the site migration workflow scoped to one URL. That workflow scrapes the page, analyzes its structure, maps content to existing blocks (creating variants only where needed), generates import infrastructure, runs the import to produce authorable content, and previews the result for verification.

## Checklist

- [ ] **Scrape the source page** — fetch HTML, extract metadata, download images, produce cleaned HTML and analysis artifacts
- [ ] **Analyze page structure** — identify sections, content sequences, and decide default-content vs. blocks; survey the available block palette (hero, cards, columns, teaser, tabs, accordion, carousel, etc.)
- [ ] **Map content to blocks** — match sequences to existing blocks; identify any new block variants required and record mappings in the page template
- [ ] **Generate import infrastructure** — create block parsers and page transformers needed to import this page
- [ ] **Run the content import** — execute the bundled import script to generate the authorable content page (via `run-bulk-import.js`; no hand-written HTML)
- [ ] **Preview & verify** — render the imported page in the local preview, compare against the original for structure and layout, and iterate on styling where blocks diverge
- [ ] **Report result** — summarize what was migrated, any blocks/variants created, and next steps for publishing

## Notes / Open Items
- New block variants will be created only where no existing block reasonably fits the source content.
- Design/CSS fidelity will be verified against the original; visual critique/fixes applied as needed.
- Publishing to Document Authoring / opening a PR is **out of scope** for this initial migration unless you request it afterward.

---
*This plan is ready to execute. Approve to switch to Execute mode and begin the migration.*
