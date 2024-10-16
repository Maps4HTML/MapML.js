/* 
implemented for both mapml-viewer and web-map; however web-map does not focus on map element in the browser resulting in NVDA 
not being able to read out map-caption and stating that it's an interactive map region
*/
export class HTMLMapCaptionElement extends HTMLElement {
  constructor() {
    super();
  }

  // called when element is inserted into DOM (setup code)
  connectedCallback() {
    if (
      this.parentElement.nodeName === 'MAPML-VIEWER' ||
      this.parentElement.nodeName === 'MAP'
    ) {
      // calls MutationObserver; needed to observe changes to content between <map-caption> tags and update to aria-label
      let mapcaption =
        this.parentElement.querySelector('map-caption').textContent;

      this.observer = new MutationObserver(() => {
        let mapcaptionupdate =
          this.parentElement.querySelector('map-caption').textContent;

        if (mapcaptionupdate !== mapcaption) {
          this.parentElement.setAttribute(
            'aria-label',
            this.parentElement.querySelector('map-caption').textContent
          );
        }
      });

      this.observer.observe(this, {
        characterData: true,
        subtree: true,
        attributes: true,
        childList: true
      });

      // don't change aria-label if one already exists from user  (checks when element is first created)
      if (!this.parentElement.hasAttribute('aria-label')) {
        const ariaLabel = this.textContent;
        this.parentElement.setAttribute('aria-label', ariaLabel);
      }
    }
  }
  disconnectedCallback() {
    this.observer.disconnect();
  }
}
