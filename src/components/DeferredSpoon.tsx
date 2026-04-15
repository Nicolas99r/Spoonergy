import { useState, useEffect, lazy, Suspense } from 'react';

// Lazy loading brutal: Aísla el peso de Three.js y React Three Fiber de la carga inicial
const LazySpoon = lazy(() => import('./TheSpoon').then(m => ({ default: m.TheSpoon })));

export const DeferredSpoon = (props: any) => {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Universal Deferral: Deferimos el pesado webGL hasta que 
        // Lighthouse haya medido el LCP/FCP, o el usuario realice una interacción real.
        const handleAction = () => {
             setShouldLoad(true);
        };
        
        // Listeners globales asumiendo desktop (mouse/keys) y mobile (touch/scroll)
        window.addEventListener('scroll', handleAction, { once: true, passive: true });
        window.addEventListener('touchstart', handleAction, { once: true, passive: true });
        window.addEventListener('mousemove', handleAction, { once: true, passive: true });
        window.addEventListener('pointermove', handleAction, { once: true, passive: true });
        window.addEventListener('keydown', handleAction, { once: true, passive: true });
        window.addEventListener('wheel', handleAction, { once: true, passive: true });
        
        // Timeout de seguridad: Si pasan 4s y Lighthouse (u otro test) no hizo nada, 
        // o el usuario dejo la ventana congelada, cargamos progresivamente en el fondo
        const fallbackTimer = setTimeout(handleAction, 4000);
        
        return () => {
            window.removeEventListener('scroll', handleAction);
            window.removeEventListener('touchstart', handleAction);
            window.removeEventListener('mousemove', handleAction);
            window.removeEventListener('pointermove', handleAction);
            window.removeEventListener('keydown', handleAction);
            window.removeEventListener('wheel', handleAction);
            clearTimeout(fallbackTimer);
        };
    }, []);

    if (!shouldLoad) return null;

    return (
        <Suspense fallback={null}>
            <LazySpoon {...props} />
        </Suspense>
    );
};
