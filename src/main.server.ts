import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { config } from './app/app.config.server';

// Quick SSR polyfills for prerendering
if (typeof localStorage === 'undefined') {
    (global as any).localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    };
}
if (typeof sessionStorage === 'undefined') {
    (global as any).sessionStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    };
}
if (typeof window === 'undefined') {
    const noop = () => {};
    (global as any).window = {
        scrollTo: noop,
        scrollY: 0,
        scrollX: 0,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => false,
        navigator: {
           clipboard: {
               writeText: () => Promise.resolve()
           }
        }
    };
}

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(AppComponent, config, context);

export default bootstrap;
