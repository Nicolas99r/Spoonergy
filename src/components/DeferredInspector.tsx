import { useState, useEffect, lazy, Suspense } from 'react';

// USAMOS IMPORTACIÓN DINÁMICA (lazy) para el inspector secundario
const SpoonInspector = lazy(() => import('./SpoonInspector').then(m => ({ default: m.SpoonInspector })));

export const DeferredInspector = () => {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const handleAction = () => {
             setShouldLoad(true);
        };
        
        window.addEventListener('scroll', handleAction, { once: true, passive: true });
        window.addEventListener('spoonergy-ready', handleAction, { once: true });
        
        // El inspector secundario puede tardar aún más en cargar si el usuario no llega a él
        const fallbackTimer = setTimeout(handleAction, 18000); 
        
        return () => {
            window.removeEventListener('scroll', handleAction);
            window.removeEventListener('spoonergy-ready', handleAction);
            clearTimeout(fallbackTimer);
        };
    }, []);

    // Placeholder con dimensiones EXACTAS para evitar CLS (Cumulative Layout Shift)
    const placeholder = (
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-3xl bg-zinc-950/20 border border-white/5 shadow-2xl">
              <div className="absolute inset-0 opacity-[0.1]" 
                     style={{ backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
              </div>
        </div>
    );

    if (!shouldLoad) return placeholder;

    return (
        <Suspense fallback={placeholder}>
            <SpoonInspector />
        </Suspense>
    );
};
