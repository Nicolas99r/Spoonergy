import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../lib/audio';

const phrases = [
    "Alineando energías...",
    "Sincronizando frecuencias...",
    "Elevando tu consciencia...",
    "Spoonergy™ Core_v1 Ready."
];

export const Preloader = () => {
    const [loading, setLoading] = useState(true);
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        // Cycle through phrases
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 1200);

        // Minimum duration 3.5s (3s for animation + 0.5s buffer)
        const timer = setTimeout(() => {
            playSound('ethereal');
            setLoading(false);
            document.body.style.overflow = 'auto'; // Re-enable scroll
        }, 3500);

        // Initially disable scroll
        document.body.style.overflow = 'hidden';

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-auto">
                    
                    {/* Curtain Panels */}
                    <motion.div 
                        initial={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
                        className="absolute top-0 left-0 w-full h-1/2 bg-black z-[-1]"
                    />
                    <motion.div 
                        initial={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
                        className="absolute bottom-0 left-0 w-full h-1/2 bg-black z-[-1]"
                    />

                    {/* Content Layer */}
                    <motion.div 
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-12"
                    >
                        {/* Abstract Symbol: Pulsing Ring */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 border border-white/20 rounded-full"
                            />
                            <motion.div 
                                animate={{ 
                                    scale: [1.2, 1, 1.2],
                                    opacity: [0.2, 0.4, 0.2]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-2 border border-white/40 rounded-full"
                            />
                            <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]" />
                        </div>

                        {/* Title Section */}
                        <div className="flex flex-col items-center gap-4">
                            <motion.h1 
                                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                                animate={{ opacity: 1, letterSpacing: '1.2em' }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className="text-white text-xs md:text-sm font-serif font-bold uppercase tracking-[1.2em] ml-[1.2em]"
                            >
                                SPOONERGY
                            </motion.h1>
                            
                            {/* Animated Phrases */}
                            <div className="h-4 overflow-hidden relative w-64 flex justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.p 
                                        key={phraseIndex}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        className="text-[9px] text-zinc-500 font-mono tracking-[0.2em] uppercase absolute"
                                    >
                                        {phrases[phraseIndex]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Minimal Progress Bar */}
                        <div className="w-48 h-[1px] bg-white/5 relative overflow-hidden">
                            <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 3, ease: "easeInOut" }}
                                className="absolute inset-0 bg-white/40"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
