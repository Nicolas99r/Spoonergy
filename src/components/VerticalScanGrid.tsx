import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/Card";

interface ScannedCardProps {
    title: string;
    description: string;
    progress: MotionValue<number>;
    range: [number, number, number, number];
}

const ScannedCard = ({ title, description, progress, range }: ScannedCardProps) => {
    // Rango: [Entra_Start, Entra_End_Hold, Sale_Start, Sale_End]
    const opacityRaw = useTransform(progress, range, [0, 1, 1, 0]);
    const scaleRaw = useTransform(progress, range, [0.85, 1, 1, 0.85]);
    const yRaw = useTransform(progress, range, [100, 0, 0, -100]);

    // Aplicación Quirúrgica de Físicas Spring para que sea hiper-fluido
    const opacity = useSpring(opacityRaw, { stiffness: 100, damping: 20 });
    const scale = useSpring(scaleRaw, { stiffness: 100, damping: 20 });
    const y = useSpring(yRaw, { stiffness: 100, damping: 20 });

    return (
        <motion.div 
            style={{ opacity, scale, y }} 
            className="absolute top-0 left-0 w-full flex items-center justify-start pointer-events-none md:pointer-events-auto"
        >
            <Card className="w-full max-w-xl shadow-2xl bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/40">
                <CardHeader>
                    <CardTitle className="text-3xl md:text-4xl text-zinc-100">{title}</CardTitle>
                    <CardDescription className="text-lg md:text-xl mt-4 text-zinc-400">{description}</CardDescription>
                </CardHeader>
            </Card>
        </motion.div>
    );
};

export const VerticalScanGrid = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // El trackeo global del scroll a través del contenedor 300vh
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="h-[300vh] w-full relative z-[60]">
            <div className="sticky top-0 h-screen w-full flex flex-col justify-center gap-12 pointer-events-none px-4">
                <h2 className="text-4xl md:text-6xl font-serif text-zinc-50 tracking-tight leading-tight w-full pointer-events-auto">
                    Mucho más que funcional.
                </h2>
                
                <div className="relative w-full h-[40vh] md:h-[30vh]">
                    <ScannedCard 
                        title="Claridad" 
                        description="Una percepción más limpia en cada momento. Sin esfuerzo. Sin interrupciones." 
                        progress={scrollYProgress}
                        range={[0.00, 0.08, 0.25, 0.33]}
                    />
                    <ScannedCard 
                        title="Calma" 
                        description="Una sensación progresiva de equilibrio interno. No inmediata. Pero constante." 
                        progress={scrollYProgress}
                        range={[0.33, 0.41, 0.58, 0.66]}
                    />
                    <ScannedCard 
                        title="Conexión" 
                        description="Una relación más consciente con lo que haces. Incluso en lo más simple." 
                        progress={scrollYProgress}
                        range={[0.66, 0.74, 0.92, 1.00]}
                    />
                </div>
            </div>
        </div>
    );
}
