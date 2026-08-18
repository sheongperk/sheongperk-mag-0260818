export default function decorate(block) {
  // Hero Experience is a CSS-only block: the background image (first row)
  // sits behind the title/subheading rich text (second row). No JS
  // decoration is required beyond what the boilerplate provides.
  block.classList.add('hero-experience');
}
