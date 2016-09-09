'use strict';


class Cards {
    constructor() {
        this.cards = Array.from(document.querySelectorAll('.card'));

        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.update = this.update.bind(this);

        this.target = null;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.screenX = 0;
        this.targetX = 0;
        this.targetBCR = null;
        this.draggingCard = false;

        
        this.addEventListenr();
        requestAnimationFrame(this.update);
    }

    addEventListenr() {
        this.cards.forEach(card => {
            card.addEventListener('touchstart', this.onStart);
            card.addEventListener('touchmove', this.onMove);
            card.addEventListener('touchend', this.onEnd);
            card.addEventListener('mousedown', this.onStart);
            card.addEventListener('mousemove', this.onMove);
            card.addEventListener('mouseup', this.onEnd);
        });
    }

    onStart(evt) {
        if (this.target) {
            return;
        }

        if (!evt.target.classList.contains('card')) {
            return;
        }

        this.target = evt.target;
        this.targetBCR = this.target.getBoundingClientRect();

        this.startX = evt.pageX || evt.touches[0].pageX;
        this.startY = evt.pageY || evt.touches[0].pageY;
        this.currentX = this.startX;
        this.currentY = this.startY;

        this.draggingCard = true;
        this.target.style.willChange = 'transform';

        evt.preventDefault();
    }

    onMove(evt) {
        if (!this.target) {
            return;
        }

        this.currentX = evt.pageX || evt.touches[0].pageX;
        this.currentY = evt.pageY || evt.touches[0].pageY;

    }

    onEnd(evt) {
        if (!this.target) {
            return;
        }

        this.targetX = 0;

        let screenX = this.currentX - this.startX;
        const threshold = this.targetBCR.width * 0.20;
        if (Math.abs(screenX) > threshold) {
            this.targetX = (screenX > 0) ?
                this.targetBCR.width:
                -this.targetBCR.width;
        }

        this.draggingCard = false;
    }

    update() {

        requestAnimationFrame(this.update);

        if (!this.target) {
            return;
        }

        if (Math.abs(this.currentY - this.startY) > 20) {
            this.draggingCard = false;
            return;
        }

        if (this.draggingCard) {
            this.screenX = this.currentX - this.startX;
        } else {
            this.screenX += (this.targetX - this.screenX) / 4;
        }

        const normalizeDragDistance =
                  (Math.abs(this.screenX) / this.targetBCR.width);
        const opacity = 1 - Math.pow(normalizeDragDistance, 3);

        this.target.style.transform = `translateX(${this.screenX}px)`;
        this.target.style.opacity = opacity;

        if (this.draggingCard) {
            return;
        }

        const isNearlyAtStart = (Math.abs(this.screenX) < 0.1);
        const isNearlyInvisible = (opacity < 0.01);

        if(isNearlyInvisible) {
            if(!this.target || !this.target.parentNode) {
                return;
            }

            this.target.parentNode.removeChild(this.target);

            const targetIndex = this.cards.indexOf(this.target);
            this.cards.splice(targetIndex, 1);

            this.animateOtherCardsIntoPosition(targetIndex);
            
        } else if(isNearlyAtStart){
            this.resetTarget();
        }
    }

    resetTarget() {
        if (!this.target) {
            return;
        }

        this.target.style.willChange = 'initial';
        this.target.style.transform = 'none';
        this.target = null;
    }


    animateOtherCardsIntoPosition(startIndex) {
        if (startIndex === this.cards.length) {
            this.resetTarget();
            return;
        }

        const onAnimationComplete = evt => {
            const card = evt.target;
            card.removeEventListener('transitionend', onAnimationComplete);
            card.style.transition = '';
            card.style.transform = '';

            this.resetTarget();
        };

        for (let i=startIndex; i<this.cards.length; i++) {
            const card = this.cards[i];
            card.style.transform = `translateY(${this.targetBCR.height + 20}px)`;
            card.addEventListener('transitionend', onAnimationComplete);
        }

        requestAnimationFrame(_ => {
            for (let i=startIndex; i<this.cards.length; i++) {
                const card = this.cards[i];
                card.style.transition = `transform 150ms cubic-bezier(0,0,0.31,1) ${i*50}ms`;
                card.style.transform = '';
            }
        });
    }
}


window.addEventListener('load',() => new Cards());
