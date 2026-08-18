/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Malaysia Airlines site-wide cleanup.
 *
 * The source is a Vue-based AEM SPA. Every piece of global chrome is rendered
 * inside an `experience-fragment global-*` wrapper (verified in cleaned.html):
 *   - global-mobile-download-app-notification (line 7)
 *   - global-header-notification            (line 39)
 *   - global-header                         (line 138, contains <header>/<nav>)
 *   - global-floating-widget                (line 1779, AskMH chat + back-to-top)
 *   - global-cookies-notification           (line 1801, .CookiesNotification)
 *   - global-footer                         (line 1809, contains <footer>)
 * Trailing tracking pixels/iframes (Adobe demdex, DoubleClick, Yahoo) live after
 * </main> (lines 2225-2231). Authorable page content is inside <main>.
 *
 * All selectors below were read from migration-work/cleaned.html; none guessed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove overlay/notification chrome before block parsing so it cannot
    // interfere with block matching inside <main>.
    WebImporter.DOMUtils.remove(element, [
      '.experience-fragment.global-mobile-download-app-notification',
      '.experience-fragment.global-header-notification',
      '.experience-fragment.global-cookies-notification',
      '.CookiesNotification',
      '.experience-fragment.global-floating-widget',
      '.floating-bottom-right-container',
      '.BtnBackToTop',
    ]);

    // This is a Vue SPA that teleports/portals some chrome to the top level as
    // siblings of the SPA root (parent ".content-page page basicpage"), so these
    // nodes live OUTSIDE the experience-fragment wrappers above and leaked into
    // the import. Selectors verified against the LIVE puppeteer-fetched DOM:
    //   - .CookiesNotificationBtmOverlaySticky : "Your cookie settings" drawer
    //     (cookie-title/description + Accept all / Customise CTAs). Distinct
    //     top-level OverlayBtmSticky node, not the .global-cookies-notification
    //     fragment removed above.
    //   - .promo-widget-container : "Exclusive deals" / "Limited-time savings"
    //     promo drawer ("Enjoy 10% off ... MHVISA10", countdown, "Learn more").
    //     Top-level teleported sibling of the SPA root, distinct from the
    //     .floating-bottom-right-container removed above.
    // Removed pre-parse so their default text/CTA content never reaches parsing.
    WebImporter.DOMUtils.remove(element, [
      '.OverlayBtmSticky.CookiesNotificationBtmOverlaySticky',
      '.CookiesNotificationBtmOverlaySticky',
      '.promo-widget-container',
    ]);

    // Responsive duplicate default content: the SPA renders each text block
    // twice, as .TextComponent.is-desktop AND .TextComponent.is-mobile. Parsers
    // target the .is-desktop copies (see page-templates.json columns-feature
    // instance "main .TextComponent.is-desktop"); the .is-mobile twins (6 of
    // them, verified live) are leftover duplicates that produced the duplicate
    // hero subheading and the trailing duplicated feature paragraphs. Remove the
    // mobile twins before parsing so only the desktop copies survive.
    WebImporter.DOMUtils.remove(element, [
      '.TextComponent.is-mobile',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome: header, nav, footer, skip link.
    WebImporter.DOMUtils.remove(element, [
      '.experience-fragment.global-header',
      '.experience-fragment.global-footer',
      'header',
      'nav',
      'footer',
      '.SkipToMainContent',
    ]);

    // Hidden SEO/duplicate-content dump: the SPA renders a single <article>
    // (H2 + H3 + ~16 <p>) that repeats the page title, hero subheading and EVERY
    // feature heading+paragraph twice. Verified live: it is a sibling OUTSIDE
    // <main>, and no authorable block on this site uses <article> (hero-experience,
    // columns-feature, tabs-promo are all <div>-based). This dump produced the
    // trailing duplicated feature paragraphs at the bottom of the output.
    WebImporter.DOMUtils.remove(element, [
      'article',
    ]);

    // Leftover duplicate hero subheading. The hero-experience parser clones the
    // subheading <h5> into its block but only replaces the <h1> element, leaving
    // the sibling subheading .TextComponent (a separate .TextComponent.is-desktop
    // holding just the <h5>) behind -> a bare duplicate <h5> after the hero block.
    // Identify it post-parse as a .TextComponent that still directly holds an <h5>
    // but does NOT wrap a generated block <table> (the H1's TextComponent now wraps
    // the hero-experience table and is thus excluded). Only the subheading matches.
    element.querySelectorAll('.TextComponent').forEach((tc) => {
      if (tc.querySelector('h5') && !tc.querySelector('table')) {
        tc.remove();
      }
    });

    // Top-of-page breadcrumb trail + secondary/subpage nav list. Verified live:
    // the ".curvy-section-breaker" wraps the .Breadcrumb (breadcrumb-link anchors:
    // "Experience", "Malaysian Hospitality", ...) and the subpage-nav Dropdown/
    // multiselect (<ul> of related pages like "Pilot Parker"), plus the bare URL
    // paragraph. It contains NO h1/hero/authorable content (confirmed), so it is
    // safe to remove wholesale.
    WebImporter.DOMUtils.remove(element, [
      '.curvy-section-breaker',
      '.Breadcrumb',
    ]);

    // Tracking pixels / sync iframes and other non-content leftovers. The
    // ad-tracking pixels (ib.adnxs.com, ad.doubleclick.net, ams*.creativecdn.com)
    // render as empty <picture> tags in the output; remove the source <img>.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'img.ywa-10000',
      'img[src*="adnxs.com"]',
      'img[src*="doubleclick.net"]',
      'img[src*="creativecdn.com"]',
      'noscript',
      'script',
      'link',
    ]);
  }
}
