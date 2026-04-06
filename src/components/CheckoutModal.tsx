import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { playSound } from '../lib/audio';

// --- STYLES ---
const glassStyle = "bg-zinc-950/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]";
const buttonStyle = "relative flex items-center justify-center bg-zinc-100 text-zinc-950 font-sans font-bold uppercase tracking-[0.2em] text-xs px-10 py-5 rounded-full transition-all duration-500 hover:bg-white hover:scale-[1.02] active:scale-[0.98]";

export const CheckoutModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Product, 2: Bag, 3: Processing, 4: Final
    
    // Listen for global open event
    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            setStep(1);
            playSound('ping');
            document.body.style.overflow = 'hidden';
        };
        window.addEventListener('open-checkout', handleOpen);
        return () => window.removeEventListener('open-checkout', handleOpen);
    }, []);

    const close = () => {
        setIsOpen(false);
        playSound('tick');
        document.body.style.overflow = 'auto';
    };

    const nextStep = () => {
        playSound('tick');
        setStep(prev => prev + 1);
    };

    // Auto-advance from Processing to Final
    useEffect(() => {
        if (step === 3) {
            const timer = setTimeout(() => {
                playSound('success');
                setStep(4);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "relative w-full max-w-xl rounded-[2.5rem] overflow-hidden flex flex-col items-center",
                            glassStyle
                        )}
                    >
                        {/* Close Trigger */}
                        <button 
                            onClick={close}
                            className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors duration-300 z-50 p-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="w-full p-10 md:p-14">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div 
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col items-center text-center"
                                    >
                                        <div className="w-24 h-24 mb-10 flex items-center justify-center relative">
                                            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full"></div>
                                            <img src="/Spoon.png" alt="Spoonergy" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight mb-2">Spoonergy™</h2>
                                        <span className="text-xl font-sans text-zinc-400 font-light mb-8">$129</span>
                                        
                                        <p className="text-sm md:text-base font-sans font-light text-zinc-500 leading-relaxed mb-12 max-w-sm">
                                            Una herramienta de alineación energética diseñada para transformar tu día a día en una experiencia consciente.
                                        </p>

                                        <div className="w-full border-t border-white/5 pt-10 mb-12 flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-zinc-500 font-mono">
                                                <span>Envío gratuito</span>
                                                <span className="text-white/60">Included</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-zinc-500 font-mono">
                                                <span>Entrega estimada</span>
                                                <span className="text-white/60">3–5 Días hábiles</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={nextStep}
                                            className={buttonStyle}
                                        >
                                            <span className="relative z-10">Add to bag</span>
                                        </button>
                                        
                                        <span className="mt-6 text-[9px] font-mono tracking-[0.2em] uppercase text-zinc-600 opacity-60">
                                            Disponibilidad limitada.
                                        </span>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div 
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col w-full"
                                    >
                                        <h2 className="text-2xl font-serif text-white tracking-tight mb-12 text-center">Your bag</h2>
                                        
                                        <div className="flex items-center justify-between py-6 border-b border-white/5 mb-12">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                                    <img src="/Spoon.png" alt="Item" className="w-8 h-8 object-contain" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-sans font-medium text-white">Spoonergy™</span>
                                                    <span className="text-xs font-mono text-zinc-500">Core v1</span>
                                                </div>
                                            </div>
                                            <span className="text-sm font-sans text-zinc-300">$129</span>
                                        </div>

                                        <div className="flex flex-col gap-4 mb-14">
                                            <div className="flex justify-between text-xs font-sans">
                                                <span className="text-zinc-500">Subtotal</span>
                                                <span className="text-zinc-300">$129</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-sans">
                                                <span className="text-zinc-500">Shipping</span>
                                                <span className="text-zinc-400">Free</span>
                                            </div>
                                            <div className="flex justify-between text-base font-sans font-medium pt-4 border-t border-white/5">
                                                <span className="text-white">Total</span>
                                                <span className="text-white">$129</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={nextStep}
                                            className={buttonStyle}
                                        >
                                            Checkout
                                        </button>
                                        
                                        <p className="mt-8 text-[9px] font-mono tracking-widest uppercase text-zinc-600 text-center">
                                            Finaliza tu compra de forma segura.
                                        </p>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div 
                                        key="step3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-20"
                                    >
                                        <div className="relative w-20 h-20 mb-10 overflow-hidden">
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 border-[1px] border-zinc-500/20 rounded-full"
                                            />
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 border-[1px] border-t-zinc-200 border-x-transparent border-b-transparent rounded-full"
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-400 animate-pulse">
                                            Processing your order…
                                        </span>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div 
                                        key="step4"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center text-center py-6"
                                    >
                                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-10">
                                            <svg className="w-8 h-8 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.34c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                        </div>

                                        <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mb-4">Spoonergy™ no está disponible.</h2>
                                        <p className="text-lg md:text-xl font-serif italic text-zinc-400 mb-14">
                                            Pero el equilibrio… ese sí lo está.
                                        </p>

                                        <button 
                                            onClick={close}
                                            className={cn(buttonStyle, "bg-transparent text-white border border-white/20 hover:bg-white/5")}
                                        >
                                            Volver
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
