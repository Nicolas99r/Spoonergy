import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        q: "¿Cómo funciona Spoonergy™?",
        a: "Spoonergy™ utiliza una estructura resonante diseñada para interactuar con tu energía natural."
    },
    {
        q: "¿Cuánto tiempo tarda en sentirse el efecto?",
        a: "Cada persona es diferente. Algunos lo perciben desde el primer uso. Otros, con el tiempo."
    },
    {
        q: "¿Necesito cambiar mi rutina?",
        a: "No. Spoonergy™ se adapta a ti."
    },
    {
        q: "¿Está científicamente comprobado?",
        a: "Spoonergy™ no busca validación externa. Su experiencia es personal."
    }
];

export const FAQList = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="space-y-8 pointer-events-auto relative w-full">
            {faqs.map((faq, index) => (
                <div 
                    key={index}
                    className="border-b border-zinc-800/60 pb-6 relative group cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <h3 className="text-lg font-sans text-zinc-200 mb-3 transition-colors duration-300 group-hover:text-white">
                        {faq.q}
                    </h3>
                    <p className="text-zinc-400 font-light text-base transition-colors duration-300 group-hover:text-zinc-300">
                        {faq.a}
                    </p>

                    <AnimatePresence>
                        {hoveredIndex === index && (
                            <motion.div
                                initial={{ opacity: 0, x: 30, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 15, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="absolute -right-4 md:-right-24 top-0 h-full flex items-center justify-center pointer-events-none"
                            >
                                <motion.img 
                                    src="/Spoon.png" 
                                    alt="Indicator" 
                                    className="h-16 md:h-20 w-auto object-contain -rotate-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                    animate={{ 
                                        x: [0, -5, 0],
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 2, 
                                        ease: "easeInOut" 
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};
