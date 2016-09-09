'use strict';

class Detabinator {

    constructor(element) {
        if (!element) {
            throw new Error('Missing required argument.');
        }

        this._inert = false;
        this._focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';
        this._focusableElements = Array.from(
            element.querySelectorAll(this._focusableElementsString)
        );
    }

    get inert() {
        return this._inert;
    }

    set inert(isInert) {
        if (this._inert === isInert) {
            return;
        }

        this._inert = isInert;
        this._focusableElements.forEach((child) => {
            if (isInert) {
                if (child.hasAttribute('tabIndex')) {
                    child.__savedTabindex = child.tabIndex;
                }
            } else {
                child.removeAttribute('tabindex');
            }
        });
    }
}
