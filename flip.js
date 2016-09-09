'use strict';

class SCFlipCard extends HTMLElement {

    static get SIDES() {
        return {
            FRONT: 1,
            BACK: 2
        };
    }

    flip() {
        if (this._locked) {
            return;
        }

        this._locked = true;

        const scale = (500 + 200) / 500;
        const sideOne = [
            {transform: `translateZ(-200px) rotate${this._axis}(0deg) scale(${scale})`},
            {transform: `translateZ(-100px) rotate${this._axis}(0deg) scale(${scale}) `, offset: 0.15},
            {transform: `translateZ(-100px) rotate${this._axis}(180deg) scale(${scale})`, offset: 0.65},
            {transform: `translateZ(-200px) rotate${this._axis}(180deg) scale(${scale})`}
        ];

        const sideTwo = [
            {transform: `translateZ(-200px) rotate${this._axis}(180deg) scale(${scale})`},
            {transform: `translateZ(-100px) rotate${this._axis}(180deg) scale(${scale})`, offset: 0.15},
            {transform: `translateZ(-100px) rotate${this._axis}(360deg) scale(${scale})`, offset: 0.65},
            {transform: `translateZ(-200px) rotate${this._axis}(360deg) scale(${scale})`}
        ];

        const timing = {
            duration: this._duration,
            iterations: 1,
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        switch(this._side) {
        case SCFlipCard.SIDES.FRONT:
            this._front.animate(sideOne, timing)
                .onfinish =  _ => {
            };
            this._back.animate(sideTwo, timing)
                .onfinish = _ => {
            };

            this._back.focus();
            break;
        case SCFlipCard.SIDES.BACK:
            this._front.animate(sideTwo, timing);
            this._back.animate(sideOne, timing);

            this._front.focus();
            break;
        default:
            throw new Error('unknown side');
        }

        this._locked = false;
        this._side = (this._side === SCFlipCard.SIDES.FRONT) ?
            SCFlipCard.SIDES.BACK :
            SCFlipCard.SIDES.FRONT;
    }

    createdCallback() {
        console.log('createdcallback called');
        this._locked = false;
        this._side = SCFlipCard.SIDES.FRONT;
        this._front = this.querySelector('.front');
        this._back = this.querySelector('.back');

        this._buttons = this.querySelectorAll('button');

        this._duration = parseInt(this.getAttribute('duration')) || 800;
        if (isNaN(this._duration)) {
            this._duration = 800;
        }

        this._axis = this.getAttribute('axis') || 'X';
        if (this._axis.toUpperCase() === 'RANDOM') {
            this._axis = (Math.random() > 0.5 ? 'Y' : 'X');
        }

    }

    attachedCallback() {
        Array.from(this._buttons).forEach(button => {
            button.addEventListener('click', _ => this.flip());
        });
    }

    detachedCallback() {
        console.log('detachedCallback called');
    }
}


document.registerElement('sc-card', SCFlipCard);


