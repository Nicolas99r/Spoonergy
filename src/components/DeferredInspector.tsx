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
        
        const fallbackTimer = setTimeout(handleAction, 12000); // Un poco más tarde que la cuchara principal
        
        return () => {
            window.removeEventListener('scroll', handleAction);
            window.removeEventListener('spoonergy-ready', handleAction);
            clearTimeout(fallbackTimer);
        };
    }, []);

    if (!shouldLoad) return <div className="w-full h-[400px] bg-zinc-900/10 rounded-3xl" />;

    return (
        <Suspense fallback={<div className="w-full h-[400px] bg-zinc-900/10 rounded-3xl" />}>
            <SpoonInspector />
        </Suspense>
    );
};
