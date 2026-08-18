/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://www.malaysiaairlines.com/sg/en/experience/malaysian-hospitality/elevating-your-journey.html
 * Generated: 2026-08-18
 *
 * Selector (page-templates.json): `main .TextComponent.is-desktop` — a broad,
 * over-matching anchor. On this page it matches 10 elements: the hero H1 & H5,
 * the six feature text blocks, and the closing H2 & intro paragraph.
 *
 * Library convention (library-description.txt): columns block — row1 = block name,
 * each subsequent row has N equal cells. xwalk: Columns blocks take NO field
 * comments (hinting.md Rule 4 exception) — cells hold plain/default content.
 *
 * Design (authoring-analysis.json): a SINGLE columns-feature block carries all six
 * alternating media+text feature rows. Media is an image (Golden Lounge), two seat
 * images (A330neo carousel row), or a YouTube embed (meals / wifi / kids / MHstudio).
 * The variant CSS alternates the media side per row, so every row is emitted as
 * [media | text] in document order.
 *
 * Because the anchor is a single text block but the block spans six ColumnControls,
 * the block is assembled ONCE (guarded via a document flag) from the six feature
 * `.ColumnControl` containers, then the leftover feature containers are removed so
 * the content is not duplicated as stray default content. Non-feature matches (hero,
 * closing text) and repeat invocations are no-ops.
 *
 * Selectors verified against cleaned.html:
 *   - feature text block: `.TextComponent.is-desktop.md\:hidden` containing an <h4>
 *     (hero/closing text blocks have no `md:hidden` and no <h4>).
 *   - media: `iframe[src*="youtube"]` (video) or content `<img>` (jpg/png, deduped;
 *     data:svg icons excluded).
 */
export default function parse(element, { document }) {
  // Only the feature text blocks (desktop variant, md:hidden, with an <h4>) drive
  // this block. Hero title/subheading and the closing heading/intro are skipped.
  const isFeatureText = element.matches('.md\\:hidden') && !!element.querySelector('h4');
  if (!isFeatureText) return;

  // Assemble the single block only once, on the first feature text encountered.
  if (document.__columnsFeatureBuilt) return;

  // Collect the six feature ColumnControls in document order: any .ColumnControl
  // whose desktop text block carries an <h4>.
  const featureCCs = Array.from(document.querySelectorAll('.ColumnControl')).filter((cc) => {
    const txt = cc.querySelector('.TextComponent.is-desktop.md\\:hidden');
    return txt && txt.querySelector('h4');
  });
  if (featureCCs.length === 0) return;

  const cells = [];

  featureCCs.forEach((cc) => {
    // ---- media cell ----
    const mediaCell = [];
    const iframe = cc.querySelector('iframe[src*="youtube"], iframe[src*="youtu.be"]');
    if (iframe) {
      // Represent the video as a link the columns block auto-embeds. Strip tracking
      // query params so only the clean /embed/{id} URL remains.
      const cleanUrl = iframe.getAttribute('src').split('?')[0];
      const a = document.createElement('a');
      a.href = cleanUrl;
      a.textContent = cleanUrl;
      mediaCell.push(a);
    } else {
      // Content images only (exclude inline data:svg icons); dedupe by src because
      // the SPA renders duplicate desktop/mobile copies.
      const seen = new Set();
      cc.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src') || '';
        if (!src || src.startsWith('data:')) return;
        if (seen.has(src)) return;
        seen.add(src);
        mediaCell.push(img.cloneNode(true));
      });
    }

    // ---- text cell ----
    const textCell = [];
    const txt = cc.querySelector('.TextComponent.is-desktop.md\\:hidden');
    if (txt) {
      txt.querySelectorAll('h4, p').forEach((node) => textCell.push(node.cloneNode(true)));
    }

    cells.push([mediaCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });

  // Place the block where the first feature container was, then drop the source
  // feature containers so their content is not left behind as duplicate default
  // content.
  featureCCs[0].replaceWith(block);
  for (let i = 1; i < featureCCs.length; i += 1) {
    featureCCs[i].remove();
  }

  document.__columnsFeatureBuilt = true;
}
