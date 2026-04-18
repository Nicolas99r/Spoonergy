import React from 'react';
import { createRoot } from 'react-dom/client';
import { DeferredSpoon } from '../components/DeferredSpoon';

export function hydrateSpoon() {
    const spoonRoot = document.getElementById('spoon-root');
    if (spoonRoot) {
        const root = createRoot(spoonRoot);
        // We pass loadInstantly={true} because the hydrator itself is deferred
        root.render(<DeferredSpoon loadInstantly={true} />);
    }
}

export function hydrateModal(lang: 'es' | 'en') {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
        // We'll dynamic import the modal to keep this bundle small
        import('../components/CheckoutModal').then(({ CheckoutModal }) => {
            const root = createRoot(modalRoot);
            root.render(<CheckoutModal lang={lang} />);
        });
    }
}
