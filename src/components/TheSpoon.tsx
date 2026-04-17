import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, type HTMLMotionProps } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { useState, useEffect, Suspense, lazy } from 'react';
import { cn } from '../lib/utils';

// Importación directa para evitar que el Suspense mantenga el modelo oculto si un subcomponente tarda más
import { FluidLayer } from './spoon/FluidLayer';
import { SpoonModel } from './spoon/SpoonModel';

const getRadians = (deg: number) => (deg * Math.PI) / 180;

interface TheSpoonProps extends HTMLMotionProps<"div"> {
    className?: string;
}

export const TheSpoon = ({ className, ...props }: TheSpoonProps) => {
    const { scrollYProgress } = useScroll();
    const [isHovered, setIsHovered] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0); 
    const [ctaHovered, setCtaHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
        if (latest < 0.1) setCurrentPhase(0);       
        else if (latest < 0.4) setCurrentPhase(1);  
        else if (latest < 0.55) setCurrentPhase(2); 
        else if (latest < 0.95) setCurrentPhase(3); 
        else if (latest < 0.99) setCurrentPhase(4); 
        else setCurrentPhase(5);                    
    });

    useEffect(() => {
        const handleCtaHover = (e: Event) => {
            const customEvent = e as CustomEvent<{ isHovered: boolean }>;
            setCtaHovered(customEvent.detail.isHovered);
        };
        window.addEventListener('cta-hover', handleCtaHover);
        return () => window.removeEventListener('cta-hover', handleCtaHover);
    }, []);

    const springConfig = { stiffness: 100, damping: 20, mass: 0.5 };
    const points = [
        0.00, 0.04, 0.05, 0.11, 0.16, 0.38, 0.40, 0.50, 0.52, 0.62, 0.64, 0.68, 0.70, 0.77, 0.80, 0.84, 0.88, 0.92, 0.95, 0.97, 0.99, 1.00
    ];
    
    const rawX = useTransform(scrollYProgress, points, [
        0, 0, 0.56, 0.64, 0.56, 0.64, -0.60, -0.60, -0.56, -0.64, 0.56, 0.64, 0.70, 0.70, 0.6, 0.7, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0
    ]);
    const rawY = useTransform(scrollYProgress, points, [
        0.1, 0.1, 0, 0, 0, 0, -1.2, -1.2, 0, 0, 0, 0, -1.5, -1.8, 0.16, 0.24, 0, 0, -0.40, -0.40, 0, 0
    ]);
    const rawRotate = useTransform(scrollYProgress, points, [
        getRadians(0), getRadians(0), getRadians(-100), getRadians(-120), getRadians(80), getRadians(100), getRadians(-90), getRadians(-100), getRadians(-40), getRadians(-50), getRadians(-5), getRadians(5), getRadians(-90), getRadians(-100), getRadians(-30), getRadians(-30), getRadians(45), getRadians(45), getRadians(0), getRadians(0), getRadians(0), getRadians(0)
    ]);
    const rawScale = useTransform(scrollYProgress, points, [
        1.0, 1.0, 0.85, 0.95, 0.85, 0.95, 3.0, 3.0, 0.95, 1.05, 0.95, 1.05, 3.0, 3.0, 0.4, 0.4, 0.8, 0.8, 1.0, 1.0, 1.0, 1.0
    ]);

    const xValue = useSpring(rawX, springConfig);
    const yValue = useSpring(rawY, springConfig);
    const rotateScroll = useSpring(rawRotate, springConfig);
    const scaleValue = useSpring(rawScale, springConfig);

    const rotate = useTransform(() => ctaHovered && currentPhase === 4 ? rotateScroll.get() + getRadians(15) : rotateScroll.get());

    return (
        <motion.div
            className={cn("absolute inset-0 w-full h-full pointer-events-none z-0 opacity-100", className)}
            {...props}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }} className="w-full h-full" dpr={isMobile ? 1 : [1, 2]}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4fb6ff" />
                <Environment preset="studio" />
                
                <Suspense fallback={null}>
                    {!isMobile && <FluidLayer isHovered={isHovered} />}
                    <SpoonModel 
                        rotateValue={rotate} scaleValue={scaleValue} 
                        xValue={xValue} yValue={yValue}
                        currentPhase={currentPhase}
                        onHoverChange={setIsHovered}
                    />
                </Suspense>

                <ContactShadows 
                    position={[0, -3, 0]} 
                    opacity={0.4} 
                    scale={10} 
                    blur={2} 
                    far={5} 
                    frames={isMobile ? 1 : 40} 
                />
            </Canvas>
        </motion.div>
    );
};
