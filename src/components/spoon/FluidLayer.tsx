import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { FluidEngine } from './FluidSimulation';

export const FluidLayer = ({ isHovered }: { isHovered: boolean }) => {
    const { gl, viewport } = useThree();
    
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

    useFrame(() => {
        const dx = (mousePos.current.x - mousePos.current.lastX) * 0.8;
        const dy = (mousePos.current.y - mousePos.current.lastY) * 0.8;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            engine.splat(mousePos.current.x, mousePos.current.y, dx, dy, smokeColor);
        }
        mousePos.current.lastX = mousePos.current.x;
        mousePos.current.lastY = mousePos.current.y;

        engine.update();

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
                depthTest={false}
                opacity={0.6}
            />
        </mesh>
    );
};
