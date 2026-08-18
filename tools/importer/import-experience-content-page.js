/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroExperienceParser from './parsers/hero-experience.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import tabsPromoParser from './parsers/tabs-promo.js';

// TRANSFORMER IMPORTS
import malaysiaairlinesCleanupTransformer from './transformers/malaysiaairlines-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-experience': heroExperienceParser,
  'columns-feature': columnsFeatureParser,
  'tabs-promo': tabsPromoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'experience-content-page',
  description: 'Malaysian Hospitality experience content page: hero banner with heading/subheading, followed by an alternating image+text feature grid (lounge, seats carousel, meals video, wifi, kids pack, entertainment), a closing CTA heading with a tabbed promotions/inspiration selector.',
  urls: [
    'https://www.malaysiaairlines.com/sg/en/experience/malaysian-hospitality/elevating-your-journey.html',
  ],
  blocks: [
    {
      name: 'hero-experience',
      instances: ['main h1'],
    },
    {
      name: 'columns-feature',
      instances: ['main .TextComponent.is-desktop'],
    },
    {
      name: 'tabs-promo',
      instances: ['main .SwitchTabHeaderItem'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  malaysiaairlinesCleanupTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    //    Skip elements already replaced by a prior parser (detached from DOM)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
