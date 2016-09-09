'use strict';

class ImageZoomer {

    constructor() {
        this.element = document.querySelector('.zoomer');
        this.target = document.querySelector('.target');
        this.canvas = document.querySelector('.zoomer__canvas');
        this.ctx = this.canvas.getContext('2d');

        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.update = this.update.bind(this);
        this.onResize = this.onResize.bind(this);

        this.targetBCR = null;
        this.zoomed = 0;
        this.targetZoomed = 0;

        this.x = 0;
        this.y = 0;
        this.trackingTouch = false;
        this.scheduledUpdate = false;

        this.initCanvas();
        this.addEventListener();
        this.onResize();

        requestAnimationFrame(this.update);
    }

    initCanvas() {
        const width = 128;
        const height = 128;
        const dPR = window.devicePixelRatio || 1;

        this.canvas.width = width * dPR;
        this.canvas.height = height * dPR;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.ctx.scale(dPR, dPR);
    }

    onStart(evt) {
        if (evt.target !== this.target) {
            return;
        }

        this.x = evt.pageX || this.touches[0].pageX;
        this.y = evt.pageY || this.touches[0].pageY;

        evt.preventDefault();
        this.trackingTouch = true;

        this.targetZoomed = 1;
        requestAnimationFrame(this.update);
    }

    onMove(evt) {
        if (!this.trackingTouch) {
            return;
        }

        this.x = evt.pageX || evt.touches[0].pageX;
        this.y = evt.pageY || evt.touches[0].pageY;
    }

    onEnd() {
        this.trackingTouch = false;
        this.targetZoomed = 0;
    }

    update() {
        const TAU = Math.PI * 2;
        const MAX_RADIUS = 46;
        const radius = this.zoomed * MAX_RADIUS;

        const targetX = (this.x - this.targetBCR.left) / this.targetBCR.width;
        const targetY = (this.y - this.targetBCR.top) / this.targetBCR.height;
        const imageScale = 3;
        const scaledTargetWidth = this.targetBCR.width * imageScale;
        const scaledTargetHeight = this.targetBCR.height * imageScale;

        const glassyGlow = this.ctx.createRadialGradient(64, 64, 64, 64, 64, 0);
        glassyGlow.addColorStop(0, 'rgba(255,255,255,0.8)');
        glassyGlow.addColorStop(0.5, 'rgba(255,255,255,0)');

        // shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.4)';
        this.ctx.shadowBlur = 12;
        this.ctx.shdowOffsetY = 8;

        // background
        this.ctx.clearRect(0, 0, 128, 128);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(64, 110 - radius, radius, 0, TAU);
        this.ctx.closePath();
        this.ctx.fill();

        // zoomed image
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(64, 110 - (radius + 1), radius * 1.03, 0, TAU);
        this.ctx.clip();
        this.ctx.closePath();
        this.ctx.drawImage(this.target,
                           -targetX * scaledTargetWidth + 64,
                           -targetY * scaledTargetHeight + 64,
                           scaledTargetWidth,
                           scaledTargetHeight);
        this.ctx.restore();

        // glassy glow
        this.ctx.fillStyle = glassyGlow;
        this.ctx.beginPath();
        this.ctx.arc(64, 110 - radius, Math.max(0, radius - 2), 0, TAU);
        this.ctx.closePath();
        this.ctx.fill();

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.zoomed += (this.targetZoomed - this.zoomed) / 3;

        this.element.style.zIndex = 10;

        
        if(this.zoomed > 0.001) {
            requestAnimationFrame(this.update);
        } else {
            this.zoomed = 0;
        }
    }

    onResize() {
        this.targetBCR = this.target.getBoundingClientRect();
    }

    addEventListener() {
        document.addEventListener('touchstart', this.onStart);
        document.addEventListener('touchmove', this.onMove);
        document.addEventListener('touchend', this.onEnd);
        document.addEventListener('mousedown', this.onStart);
        document.addEventListener('mousemove', this.onMove);
        document.addEventListener('mouseup', this.onEnd);
        window.addEventListener('resize', this.onResize);
    }

    removeEventListener() {
        document.removeEventListener('touchstart', this.onStart);
        document.removeEventListener('touchmove', this.onMove);
        document.removeEventListener('touchend', this.onEnd);
        document.removeEventListener('mousedown', this.onStart);
        document.removeEventListener('mousemove', this.onMove);
        document.removeEventListener('mouseup', this.onEnd);
        window.removeEventListener('resize', this.onResize);
    }
}


window.addEventListener('load', () => new ImageZoomer());

