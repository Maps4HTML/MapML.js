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
            if (document.querySelector('map-caption').innerHTML == this.parentElement.getAttribute('aria-label'))
            {
                this.parentElement.setAttribute('aria-label', this.textContent); 
            }
        });
    }
    // function to retrieve caption content 
    get ariaLabel() {
        return this.textContent;
    }

    // called when element is inserted into DOM (setup code)
    connectedCallback() {
        this.observer.observe(this, {
            characterData: true,
            subtree: true,
            attributes: true,
            childList: true
        });
        
        // don't change aria-label if one already exists from user  (checks when element is first created)
        if (!this.parentElement.hasAttribute('aria-label'))
        {
            const ariaLabel = this.textContent;
            this.parentElement.setAttribute('aria-label', ariaLabel);
        }
    }
    disconnectedCallback() {
        this.observer.disconnect();
    }
}
