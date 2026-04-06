import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, type HTMLMotionProps } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Float, ContactShadows, Center } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { cn } from '../lib/utils';
import * as THREE from 'three';
import { FluidEngine } from './fluid/FluidSimulation';

const getRadians = (deg: number) => (deg * Math.PI) / 180;

// Capa de Fondo para Fluidos (Navier-Stokes unificado)
const FluidLayer = ({ isHovered }: { isHovered: boolean }) => {
    const { gl, size, viewport } = useThree();
    
    // Inicializamos el motor con el renderer de R3F
    const engine = useMemo(() => new FluidEngine(gl), [gl]);
    const meshRef = useRef<THREE.Mesh>(null);
    const mousePos = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });

    // Color Gris Plateado ultra-sutil
    const smokeColor = useMemo(() => new THREE.Vector3(0.01, 0.01, 0.012).multiplyScalar(0.8), []);

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const y = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            mousePos.current.x = x;
            mousePos.current.y = y;
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    useFrame((state) => {
        // 1. Inyección de Cursor (Único manipulador activo)
        const dx = (mousePos.current.x - mousePos.current.lastX) * 0.8;
        const dy = (mousePos.current.y - mousePos.current.lastY) * 0.8;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            engine.splat(mousePos.current.x, mousePos.current.y, dx, dy, smokeColor);
        }
        mousePos.current.lastX = mousePos.current.x;
        mousePos.current.lastY = mousePos.current.y;

        // 3. Update Sim
        engine.update();

        // 4. Mapear textura al plano de fondo
        if (meshRef.current) {
            (meshRef.current.material as THREE.MeshBasicMaterial).map = engine.getTexture();
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
                transparent 
                blending={THREE.AdditiveBlending} 
                depthWrite={false} 
                depthTest={false}  // Mantiene el humo al fondo sin importar que esté en z=0
                opacity={0.6}
            />
        </mesh>
    );
};

// Sub-componente WebGL para la Cuchara 3D
const SpoonModel = ({ rotateValue, scaleValue, xValue, yValue, isHovered, currentPhase, onHoverChange }: any) => {
    const { scene } = useGLTF('/uploads_files_5450612_cgt_fmcg_cutlery_020.glb');
    const meshRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    
    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color("#e0e0e0"),
                    metalness: 1.0,
                    roughness: 0.15,
                    envMapIntensity: 2.0,
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    useFrame(() => {
        if (meshRef.current) {
            const rot = rotateValue.get();
            const s = scaleValue.get() * 35;
            
            const posX = xValue.get() * (viewport.width / 2);
            const posY = yValue.get() * (viewport.height / 2);
            
            meshRef.current.position.x = posX;
            meshRef.current.position.y = posY;
            meshRef.current.rotation.z = rot;
            meshRef.current.rotation.y = rot * 0.5;
            meshRef.current.rotation.x = rot * 0.2;
            meshRef.current.scale.set(s, s, s);
        }
    });

    return (
        <Float 
            speed={currentPhase === 5 ? 0 : 2}
            rotationIntensity={currentPhase === 5 ? 0 : 0.5} 
            floatIntensity={currentPhase === 5 ? 0 : 1}
            floatingRange={[-0.1, 0.1]}
        >
            <group 
                ref={meshRef} 
                onPointerOver={() => onHoverChange(true)} 
                onPointerOut={() => onHoverChange(false)}
            >
                <Center>
                    <primitive object={scene} position={[0, 0, 0]} rotation={[0, 0, 0]}/>
                </Center>
            </group>
        </Float>
    );
};

interface TheSpoonProps extends HTMLMotionProps<"div"> {
    className?: string;
}

export const TheSpoon = ({ className, ...props }: TheSpoonProps) => {
    const { scrollYProgress } = useScroll();
    const [isHovered, setIsHovered] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0); 
    const [ctaHovered, setCtaHovered] = useState(false);

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
        0.00, 0.04, 
        0.05, 0.11, 
        0.16, 0.38, 
        0.40, 0.50, 
        0.52, 0.62, 
        0.64, 0.68, 
        0.70, 0.77, 
        0.80, 0.84, 
        0.88, 0.92, 
        0.95, 0.97, 
        0.99, 1.00
    ];
    
    const rawX = useTransform(scrollYProgress, points, [
        0, 0, 
        0.56, 0.64, 
        0.56, 0.64, 
        -0.60, -0.60, 
        -0.56, -0.64, 
        0.56, 0.64, 
        0.70, 0.70, 
        0.6, 0.7, 
        2.0, 2.0, 
        2.0, 2.0, 
        2.0, 2.0
    ]);
    const rawY = useTransform(scrollYProgress, points, [
        0.1, 0.1, 
        0, 0, 
        0, 0, 
        -1.2, -1.2, 
        0, 0, 
        0, 0, 
        -1.5, -1.8, 
        0.16, 0.24, 
        0, 0, 
        -0.40, -0.40, 
        0, 0
    ]);
    const rawRotate = useTransform(scrollYProgress, points, [
        getRadians(0), getRadians(0), 
        getRadians(-100), getRadians(-120), 
        getRadians(80), getRadians(100), 
        getRadians(-90), getRadians(-100), 
        getRadians(-40), getRadians(-50), 
        getRadians(-5), getRadians(5), 
        getRadians(-90), getRadians(-100), 
        getRadians(-30), getRadians(-30), 
        getRadians(45), getRadians(45), 
        getRadians(0), getRadians(0), 
        getRadians(0), getRadians(0)
    ]);
    const rawScale = useTransform(scrollYProgress, points, [
        1.0, 1.0, 
        0.85, 0.95, 
        0.85, 0.95, 
        3.0, 3.0, 
        0.95, 1.05, 
        0.95, 1.05, 
        3.0, 3.0, 
        0.4, 0.4, 
        0.8, 0.8, 
        1.0, 1.0, 
        1.0, 1.0
    ]);

    const xValue = useSpring(rawX, springConfig);
    const yValue = useSpring(rawY, springConfig);
    const rotateScroll = useSpring(rawRotate, springConfig);
    const scaleValue = useSpring(rawScale, springConfig);

    const rotate = useTransform(() => ctaHovered && currentPhase === 4 ? rotateScroll.get() + getRadians(15) : rotateScroll.get());

    return (
        <motion.div
            className={cn("absolute inset-0 w-full h-full pointer-events-none z-0", className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.0 }}
            {...props}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }} className="w-full h-full">
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4fb6ff" />
                <Environment preset="studio" />
                
                <Suspense fallback={null}>
                    <FluidLayer isHovered={isHovered} />
                    <SpoonModel 
                        rotateValue={rotate} scaleValue={scaleValue} 
                        xValue={xValue} yValue={yValue}
                        isHovered={isHovered} currentPhase={currentPhase}
                        onHoverChange={setIsHovered}
                    />
                </Suspense>

                <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2} far={5} />
            </Canvas>
        </motion.div>
    );
};
