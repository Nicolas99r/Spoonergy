import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "../lib/utils";

interface TestimonialProps {
    quote: string;
    author: string;
    tag: string;
    delay?: number;
    className?: string;
}

const TestimonialCard = ({ quote, author, tag, delay = 0, className }: TestimonialProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { once: true, margin: "-10%" });
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
                "relative p-8 md:p-10 rounded-[2rem] border transition-all duration-700 ease-out flex flex-col justify-between group overflow-hidden pointer-events-auto",
                isHovered 
                    ? "bg-zinc-900/60 border-zinc-500/30 shadow-[0_0_40px_rgba(255,255,255,0.03)] scale-[1.02]" 
                    : "bg-zinc-900/20 border-zinc-700/20 shadow-none scale-100",
                "backdrop-blur-md",
                className
            )}
        >
            {/* Ambient inner glow on hover */}
            <div 
                className={cn(
                    "absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity duration-700 pointer-events-none",
                    isHovered ? "opacity-100" : "opacity-0"
                )} 
            />
            
            <div className="relative z-10 w-full">
                <svg className="w-8 h-8 text-zinc-600 mb-6 transition-colors duration-500 group-hover:text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                
                <p className="text-xl md:text-2xl lg:text-3xl font-serif text-zinc-200 leading-relaxed tracking-wide mb-12 transition-colors duration-500 group-hover:text-zinc-50">
                    {quote}
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between w-full mt-auto">
                <div className="flex flex-col">
                    <span className="font-sans font-medium text-zinc-200 text-sm md:text-base tracking-wide uppercase">
                        {author}
                    </span>
                    <span className="font-sans font-light text-zinc-400 text-xs md:text-sm mt-1">
                        {tag}
                    </span>
                </div>
                {/* Verified badge */}
                <div className={cn(
                    "w-8 h-8 rounded-full border border-zinc-700/50 flex items-center justify-center transition-all duration-500",
                    isHovered ? "bg-zinc-800 border-zinc-500" : "bg-transparent"
                )}>
                    <svg className={cn(
                        "w-4 h-4 transition-colors duration-500",
                        isHovered ? "text-zinc-100" : "text-zinc-600"
                    )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
};

import { ui } from "../i18n/ui";

interface TestimonialGridProps {
    lang?: 'es' | 'en';
}

export const TestimonialGrid = ({ lang = 'es' }: TestimonialGridProps) => {
    const t = (key: keyof typeof ui['es']) => ui[lang][key] || ui['es'][key];
    
    return (
        <div className="w-full relative z-[60] py-20">
            {/* Header / Intro */}
            <div className="w-full flex flex-col items-center justify-center mb-24 text-center pointer-events-none">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-4xl md:text-6xl font-serif text-zinc-50 tracking-tight"
                >
                    {t('testimonials.title')}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="text-zinc-300 mt-6 text-lg md:text-xl font-light tracking-wide"
                >
                    {lang === 'en' ? "Don't trust us. Trust the experience." : "No confíes en nosotros. Confía en la experiencia."}
                </motion.p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto px-4 md:px-12">
                <TestimonialCard 
                    quote={t('testimonials.1.text')}
                    author={t('testimonials.1.author')}
                    tag={t('testimonials.1.role')}
                    delay={0.1}
                    className="md:mt-0 min-h-[400px] md:min-h-[450px]"
                />
                <TestimonialCard 
                    quote={t('testimonials.2.text')}
                    author={t('testimonials.2.author')}
                    tag={t('testimonials.2.role')}
                    delay={0.3}
                    className="md:mt-16 min-h-[400px] md:min-h-[450px]"
                />
                <TestimonialCard 
                    quote={t('testimonials.3.text')}
                    author={t('testimonials.3.author')}
                    tag={t('testimonials.3.role')}
                    delay={0.5}
                    className="md:mt-32 min-h-[400px] md:min-h-[450px]"
                />
            </div>
        </div>
    );
};
