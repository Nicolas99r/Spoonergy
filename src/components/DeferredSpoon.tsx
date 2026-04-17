import { useState, useEffect, lazy, Suspense } from 'react';

// Importación directa para reducir la cadena de carga y asegurar que aparezca al hidratar
import { TheSpoon } from './TheSpoon';

export const DeferredSpoon = (props: any) => {
    const [shouldLoad, setShouldLoad] = useState(props.loadInstantly || false);

    useEffect(() => {
        // Si ya está cargando instantáneamente, no necesitamos añadir listeners de interacción para "despertarlo"
        if (props.loadInstantly) return;

        const handleAction = () => {
             setShouldLoad(true);
        };
        
        window.addEventListener('scroll', handleAction, { once: true, passive: true });
        window.addEventListener('touchstart', handleAction, { once: true, passive: true });
        window.addEventListener('mousemove', handleAction, { once: true, passive: true });
        window.addEventListener('keydown', handleAction, { once: true, passive: true });
        window.addEventListener('wheel', handleAction, { once: true, passive: true });
        
        const fallbackTimer = setTimeout(handleAction, 5000);
        
        return () => {
            window.removeEventListener('scroll', handleAction);
            window.removeEventListener('touchstart', handleAction);
            window.removeEventListener('mousemove', handleAction);
            window.removeEventListener('keydown', handleAction);
            window.removeEventListener('wheel', handleAction);
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
