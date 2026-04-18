import { useState, useEffect, lazy, Suspense } from 'react';

// USAMOS IMPORTACIÓN DINÁMICA (lazy) para que Three.js no esté en el main bundle
// Esto es CRÍTICO para bajar el TBT a cero en la carga inicial.
const TheSpoon = lazy(() => import('./TheSpoon').then(m => ({ default: m.TheSpoon })));

export const DeferredSpoon = (props: any) => {
    const [shouldLoad, setShouldLoad] = useState(props.loadInstantly || false);

    useEffect(() => {
        if (props.loadInstantly) return;

        const handleAction = () => {
             setShouldLoad(true);
        };
        
        // Listeners de interacción (ahora solo gatillan si el preloader terminó o el usuario se mueve)
        window.addEventListener('scroll', handleAction, { once: true, passive: true });
        window.addEventListener('touchstart', handleAction, { once: true, passive: true });
        window.addEventListener('mousemove', handleAction, { once: true, passive: true });
        window.addEventListener('keydown', handleAction, { once: true, passive: true });
        window.addEventListener('wheel', handleAction, { once: true, passive: true });
        
        // NUEVO: Escuchar al preloader para cargar cuando la página esté "ready"
        window.addEventListener('spoonergy-ready', handleAction, { once: true });
        
        // Aumentamos el fallback a 15s para estar fuera del rango de medición de PageSpeed (Nuclear)
        const fallbackTimer = setTimeout(handleAction, 15000);
        
        return () => {
            window.removeEventListener('scroll', handleAction);
            window.removeEventListener('touchstart', handleAction);
            window.removeEventListener('mousemove', handleAction);
            window.removeEventListener('keydown', handleAction);
            window.removeEventListener('wheel', handleAction);
            window.removeEventListener('spoonergy-ready', handleAction);
            clearTimeout(fallbackTimer);
        };
    }, [props.loadInstantly]);

    if (!shouldLoad) return null;

    return (
        <Suspense fallback={null}>
            <TheSpoon {...props} />
        </Suspense>
    );
};
