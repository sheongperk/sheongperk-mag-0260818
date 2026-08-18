import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  // This project serves authored content under /content; prefer the migrated
  // footer there and fall back to the site-root footer when it is not present.
  if (!footerMeta) {
    const contentFooter = await fetch('/content/footer.plain.html', { method: 'HEAD' })
      .then((r) => r.ok)
      .catch(() => false);
    if (contentFooter) footerPath = '/content/footer';
  }
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // footer.plain.html uses relative image paths (validator requirement); they
  // are stored under /content/images. Rewrite to an absolute content path so
  // they resolve regardless of the current page URL.
  footer.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('/')) {
      img.setAttribute('src', `/content/${src.replace(/^\.?\/?/, '')}`);
    }
  });

  block.append(footer);
}
