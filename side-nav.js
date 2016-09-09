'use strict';

class SideNav {

    constructor() {
        this._router = document.querySelector('sc-router');

        this.showButtonEl = document.querySelector('.js-menu-show');
        this.hideButtonEl = document.querySelector('.js-menu-hide');
        this.sideNavEl = document.querySelector('.js-side-nav');
        this.sideNavContainerEl = document.querySelector('.js-side-nav-container');

        this.detabinator = new Detabinator(this.sideNavContainerEl);
        this.detabinator.inert = true;

        this.showSideNav = this.showSideNav.bind(this);
        this.hideSideNav = this.hideSideNav.bind(this);
        this.blockClicks = this.blockClicks.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onTransitionEnd = this.onTransitionEnd.bind(this);
        this.update = this.update.bind(this);

        this.startX = 0;
        this.currentX = 0;
        this.touchingSideNav = false;

        this.supportsPassive = undefined;
        this.addEventListeners();
    }


    addEventListeners() {
        this.showButtonEl.addEventListener('click', this.showSideNav);
        this.hideButtonEl.addEventListener('click', this.hideSideNav);
        this.sideNavEl.addEventListener('click', this.hideSideNav);
        this.sideNavContainerEl.addEventListener('click', this.blockClicks);

        this.sideNavEl.addEventListener('touchstart', this.onTouchStart, this.applyPassive());
        this.sideNavEl.addEventListener('touchmove', this.onTouchMove, this.applyPassive());
        this.sideNavEl.addEventListener('touchend', this.onTouchEnd, this.applyPassive());
        this.sideNavEl.addEventListener('mousedown', this.onTouchStart, this.applyPassive());
        this.sideNavEl.addEventListener('mousemove', this.onTouchMove, this.applyPassive());
        this.sideNavEl.addEventListener('mouseup', this.onTouchEnd, this.applyPassive());
    }

    applyPassive() {
        if (this.supportsPassive !== undefined) {
            return this.supportsPassive ? {passive: true} : false;
        }
        let isSupported = false;

        try {
            document.addEventListener('test', null, {get passive() {
                isSupported = true;
            }});
        } catch(e) { }
        this.supportsPassive = isSupported;
        return this.applyPassive();
    }

    blockClicks(e) {
        e.stopPropagation();
    }

    onTransitionEnd(e) {
        this.sideNavEl.classList.remove('side-nav-animatable');
        this.sideNavEl.removeEventListener('transitionend', this.onTransitionEnd);
    }

    onTouchStart(e) {
        if (!this.sideNavEl.classList.contains('side-nav--visible')) {
            return;
        }
        this.startX = e.pageX || e.touches[0].pageX;
        this.currentX = this.startX;
        this.touchingSideNav = true;
        requestAnimationFrame(this.update);
    }

    onTouchMove(e) {
        if (!this.touchingSideNav) {
            return;
        }
        this.currentX = e.pageX || e.touches[0].pageX;
        const translateX = Math.min(0, this.currentX - this.startX);
    }

    onTouchEnd(e) {
        if (!this.touchingSideNav) {
            return;
        }

        this.touchingSideNav = false;

        const translateX = Math.min(0, this.currentX - this.startX);

        this.sideNavContainerEl.style.transform = '';
        this._router.go(e.target.getAttribute('href'));

        this.hideSideNav(e);
    }

    update() {
        if (!this.touchingSideNav) {
            return;
        }
        requestAnimationFrame(this.update);
        const translateX = Math.min(0, this.currentX - this.startX);
        this.sideNavContainerEl.style.transform = `transformX(${translateX}px)`;
    }

    showSideNav() {
        this.sideNavEl.classList.add('side-nav--animatable');
        this.sideNavEl.classList.add('side-nav--visible');
        this.detabinator.inert = false;
        this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
    }

    hideSideNav(e) {
        e.stopPropagation();
        this.sideNavEl.classList.add('side-nav--animatable');
        this.sideNavEl.classList.remove('side-nav--visible');
        this.detabinator.inert = true;
        this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
    }
}

new SideNav();
