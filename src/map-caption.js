import './leaflet.js'; 
import './mapml.js'; 

/* 
implemented for both mapml-viewer and web-map; however web-map does not focus on map element in the browser resulting in NVDA 
not being able to read out map-caption and stating that it's an interactive map region
*/
export class MapCaption extends HTMLElement {
    constructor() {
        super();
        // calls MutationObserver; needed to observe changes to content between <map-caption> tags and update to aria-label
        this.observer = new MutationObserver(() => {
            this.parentElement.setAttribute('aria-label', this.textContent); 
        });

        this.map = this.parentElement;  
    }
    // function to retrieve caption content 
    get ariaLabel() {
        return this.textContent;
    }
    // function to allow changing of caption content programmatically (changes both aria-label and map-caption content)
    set ariaLabel (val) {
        this.innerHTML = val;
        this.parentElement.setAttribute('aria-label', val);
    }
    // called when element is inserted into DOM (setup code)
    connectedCallback() {
        this.observer.observe(this, {
            characterData: true,
            subtree: true,
            attributes: true,
            childList: true
        });
        const ariaLabel = this.textContent;
        this.parentElement.setAttribute('aria-label', ariaLabel);
    }
    disconnectedCallback() {
        this.observer.disconnect();

        // removes aria-label when map-caption is removed
        this.map.removeAttribute('aria-label');
    }
}
