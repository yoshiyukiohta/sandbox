'use strict';

class SCRouter extends HTMLElement{

    _onChanged() {
        const path = window.location.pathname;
        const routes = Array.from(this._routes.keys());
        const route = routes.find(r => r.test(path));
        const data = route.exec(path);
        
        if (!route) {
            return;
        }

        this._newView = this._routes.get(route);

        if (this._isTransitioningBetweenViews) {
            return Promise.resolve();
        }
        this._isTransitioningBetweenViews = true;

        let outViewPromise = Promise.resolve();

        if (this._currentView) {
            if (this._currentView === this._newView) {
                this._isTransitioningBetweenViews = false;
                return this._currentView.update(data);
            }

            outViewPromise = this._currentView.out(data);
        }

        return outViewPromise
            .then(_ => {
                this._currentView = this._newView;
                this._isTransitioningBetweenViews = false;
                return this._newView.in(data);
            });
    }

    go(url) {
        window.history.pushState(null, null, url);
        return this._onChanged();
    }

    addRoute(route, view) {
        if (this._routes.has(route)) {
            return console.warn(`Route already exists: ${route}`);
        }
        this._routes.set(route, view);
    }

    _addRoutes() {
        let views = Array.from(document.querySelectorAll('sc-view'));
        views.forEach(view => {
            if (!view.route) {
                return;
            }
            this.addRoute(new RegExp(view.route, 'i'), view);
        });
    }

    _removeRoutes() {
        this._routes.delete(route);
    }

    _clearRoutes() {
        this._routes.clear();
    }

    createdCallback() {
        this._onChanged = this._onChanged.bind(this);
        this._routes = new Map();
    }

    attachedCallback() {
        window.addEventListener('popstate', this._onChanged);
        this._clearRoutes();
        this._addRoutes();
        this._onChanged();
    }

    detachedCallback() {
        window.removeEventListener('popstate', this._onChanged);
    }
}

document.registerElement('sc-router', SCRouter);
