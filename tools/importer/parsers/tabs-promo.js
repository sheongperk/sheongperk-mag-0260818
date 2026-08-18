/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-promo. Base: tabs.
 * Source: https://www.malaysiaairlines.com/sg/en/experience/malaysian-hospitality/elevating-your-journey.html
 * Generated: 2026-08-18
 *
 * Selector (page-templates.json): `main .SwitchTabHeaderItem` — matches the two tab
 * header buttons ("Latest promotions", "Travel inspiration").
 *
 * Library convention (library-description.txt): tabs block — 2 columns, row1 = block
 * name, each subsequent row = [tab label | tab content]. Tab content can hold
 * headings, links, images, richtext.
 *
 * xwalk model (_tabs-promo.json → tabs-promo-item): container block whose child item
 * fields are:
 *   - title (Tab Title)            → the tab label (first cell of the row).
 *   - content_heading + content_headingType (collapsed) → banner overlay heading.
 *   - content_image (reference)    → the banner background image.
 *   - content_richtext             → banner subtext + Explore CTA link.
 * Per hinting.md: container-block child rows carry field comments; `content_*` fields
 * share the `content_` prefix so they group into the single content cell; the
 * `*Type`-suffixed field is collapsed (no comment).
 *
 * Source reality (verified against the LIVE DOM via the validator runtime, not just
 * cleaned.html): the tab labels render as `.SwitchTabHeaderItem` text; each tab's
 * content is a `.SwitchTabContent .Banner` whose anchor is the Explore CTA
 * (/promotions.html, /plan-trip/destinations.html) wrapping the banner background
 * image. The overlay heading/subtext described in the authoring analysis are empty
 * Vue placeholders in the DOM (no text nodes), so only the content that actually
 * exists — image + CTA link — is emitted; empty heading/subtext cells are omitted
 * (never fabricated).
 *
 * The block spans a single `.SwitchTab` container while the anchor matches per-button,
 * so the block is assembled ONCE (guarded via a document flag) and the source
 * `.SwitchTab` is replaced; the second button invocation is a no-op.
 */
export default function parse(element, { document }) {
  const switchTab = element.closest('.SwitchTab');
  if (!switchTab) return;

  // Build once; the second matched header button is a no-op.
  if (document.__tabsPromoBuilt) return;

  // Tab labels in document order.
  const labels = Array.from(switchTab.querySelectorAll('.SwitchTabHeaderItem'))
    .map((btn) => btn.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  // Tab content banners live under .SwitchTabContent (excludes the unrelated seat
  // carousel banners, which sit under .swiper elsewhere on the page).
  const content = switchTab.querySelector('.SwitchTabContent');
  const banners = content ? Array.from(content.querySelectorAll('.Banner')) : [];

  if (labels.length === 0 || banners.length === 0) {
    return; // nothing to build — leave DOM untouched
  }

  const cells = [];
  const rowCount = Math.max(labels.length, banners.length);

  for (let i = 0; i < rowCount; i += 1) {
    const label = labels[i] || '';
    const banner = banners[i] || null;

    // ---- cell 1: tab title ----
    const titleCell = [];
    titleCell.push(document.createComment(' field:title '));
    if (label) titleCell.push(document.createTextNode(label));

    // ---- cell 2: tab content (content_image + content_richtext) ----
    const contentCell = [];

    const img = banner ? banner.querySelector('img[src]') : null;
    if (img) {
      contentCell.push(document.createComment(' field:content_image '));
      contentCell.push(img.cloneNode(true));
    }

    // Explore CTA link (banner anchor). Rebuilt as a clean <a> with visible text so
    // it survives as a markdown link in the richtext field.
    const anchor = banner ? banner.querySelector('a[href]') : null;
    const href = anchor ? anchor.getAttribute('href') : null;
    if (href) {
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = 'Explore now';
      contentCell.push(document.createComment(' field:content_richtext '));
      contentCell.push(cta);
    }

    cells.push([titleCell, contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-promo', cells });
  switchTab.replaceWith(block);

  document.__tabsPromoBuilt = true;
}
