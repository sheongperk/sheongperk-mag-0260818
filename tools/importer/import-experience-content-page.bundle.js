/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-experience-content-page.js
  var import_experience_content_page_exports = {};
  __export(import_experience_content_page_exports, {
    default: () => import_experience_content_page_default
  });

  // tools/importer/parsers/hero-experience.js
  function parse(element, { document }) {
    const container = element.closest(".generic-container") || element.parentElement;
    const title = element.cloneNode(true);
    const subheading = container ? container.querySelector("h5") : null;
    if (!title && !subheading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([""]);
    const textCell = [];
    textCell.push(document.createComment(" field:text "));
    if (title) textCell.push(title);
    if (subheading) textCell.push(subheading.cloneNode(true));
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-experience", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document }) {
    const isFeatureText = element.matches(".md\\:hidden") && !!element.querySelector("h4");
    if (!isFeatureText) return;
    if (document.__columnsFeatureBuilt) return;
    const featureCCs = Array.from(document.querySelectorAll(".ColumnControl")).filter((cc) => {
      const txt = cc.querySelector(".TextComponent.is-desktop.md\\:hidden");
      return txt && txt.querySelector("h4");
    });
    if (featureCCs.length === 0) return;
    const cells = [];
    featureCCs.forEach((cc) => {
      const mediaCell = [];
      const iframe = cc.querySelector('iframe[src*="youtube"], iframe[src*="youtu.be"]');
      if (iframe) {
        const cleanUrl = iframe.getAttribute("src").split("?")[0];
        const a = document.createElement("a");
        a.href = cleanUrl;
        a.textContent = cleanUrl;
        mediaCell.push(a);
      } else {
        const seen = /* @__PURE__ */ new Set();
        cc.querySelectorAll("img").forEach((img) => {
          const src = img.getAttribute("src") || "";
          if (!src || src.startsWith("data:")) return;
          if (seen.has(src)) return;
          seen.add(src);
          mediaCell.push(img.cloneNode(true));
        });
      }
      const textCell = [];
      const txt = cc.querySelector(".TextComponent.is-desktop.md\\:hidden");
      if (txt) {
        txt.querySelectorAll("h4, p").forEach((node) => textCell.push(node.cloneNode(true)));
      }
      cells.push([mediaCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    featureCCs[0].replaceWith(block);
    for (let i = 1; i < featureCCs.length; i += 1) {
      featureCCs[i].remove();
    }
    document.__columnsFeatureBuilt = true;
  }

  // tools/importer/parsers/tabs-promo.js
  function parse3(element, { document }) {
    const switchTab = element.closest(".SwitchTab");
    if (!switchTab) return;
    if (document.__tabsPromoBuilt) return;
    const labels = Array.from(switchTab.querySelectorAll(".SwitchTabHeaderItem")).map((btn) => btn.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    const content = switchTab.querySelector(".SwitchTabContent");
    const banners = content ? Array.from(content.querySelectorAll(".Banner")) : [];
    if (labels.length === 0 || banners.length === 0) {
      return;
    }
    const cells = [];
    const rowCount = Math.max(labels.length, banners.length);
    for (let i = 0; i < rowCount; i += 1) {
      const label = labels[i] || "";
      const banner = banners[i] || null;
      const titleCell = [];
      titleCell.push(document.createComment(" field:title "));
      if (label) titleCell.push(document.createTextNode(label));
      const contentCell = [];
      const img = banner ? banner.querySelector("img[src]") : null;
      if (img) {
        contentCell.push(document.createComment(" field:content_image "));
        contentCell.push(img.cloneNode(true));
      }
      const anchor = banner ? banner.querySelector("a[href]") : null;
      const href = anchor ? anchor.getAttribute("href") : null;
      if (href) {
        const cta = document.createElement("a");
        cta.href = href;
        cta.textContent = "Explore now";
        contentCell.push(document.createComment(" field:content_richtext "));
        contentCell.push(cta);
      }
      cells.push([titleCell, contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-promo", cells });
    switchTab.replaceWith(block);
    document.__tabsPromoBuilt = true;
  }

  // tools/importer/transformers/malaysiaairlines-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".experience-fragment.global-mobile-download-app-notification",
        ".experience-fragment.global-header-notification",
        ".experience-fragment.global-cookies-notification",
        ".CookiesNotification",
        ".experience-fragment.global-floating-widget",
        ".floating-bottom-right-container",
        ".BtnBackToTop"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".OverlayBtmSticky.CookiesNotificationBtmOverlaySticky",
        ".CookiesNotificationBtmOverlaySticky",
        ".promo-widget-container"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".TextComponent.is-mobile"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".experience-fragment.global-header",
        ".experience-fragment.global-footer",
        "header",
        "nav",
        "footer",
        ".SkipToMainContent"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "article"
      ]);
      element.querySelectorAll(".TextComponent").forEach((tc) => {
        if (tc.querySelector("h5") && !tc.querySelector("table")) {
          tc.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".curvy-section-breaker",
        ".Breadcrumb"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "img.ywa-10000",
        'img[src*="adnxs.com"]',
        'img[src*="doubleclick.net"]',
        'img[src*="creativecdn.com"]',
        "noscript",
        "script",
        "link"
      ]);
    }
  }

  // tools/importer/import-experience-content-page.js
  var parsers = {
    "hero-experience": parse,
    "columns-feature": parse2,
    "tabs-promo": parse3
  };
  var PAGE_TEMPLATE = {
    name: "experience-content-page",
    description: "Malaysian Hospitality experience content page: hero banner with heading/subheading, followed by an alternating image+text feature grid (lounge, seats carousel, meals video, wifi, kids pack, entertainment), a closing CTA heading with a tabbed promotions/inspiration selector.",
    urls: [
      "https://www.malaysiaairlines.com/sg/en/experience/malaysian-hospitality/elevating-your-journey.html"
    ],
    blocks: [
      {
        name: "hero-experience",
        instances: ["main h1"]
      },
      {
        name: "columns-feature",
        instances: ["main .TextComponent.is-desktop"]
      },
      {
        name: "tabs-promo",
        instances: ["main .SwitchTabHeaderItem"]
      }
    ]
  };
  var transformers = [
    transform
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_experience_content_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_experience_content_page_exports);
})();
