import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

const SpoonModel = () => {
    const { scene } = useGLTF('/bec02450-cf3d-4613-a784-0b35e03f9c18.glb');
    
    // IMPORTANT: Clone the scene to avoid mutating the main spoon used in the rest of the page
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);
    
    React.useLayoutEffect(() => {
        clonedScene.traverse((child) => {
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
    }, [clonedScene]);

    return (
        <Center>
            <primitive 
                object={clonedScene} 
                scale={25} 
                rotation={[0, 0, 0]} 
            />
        </Center>
    );
};

export const SpoonInspector = () => {
    return (
        <div className="relative w-full h-[300px] md:h-[400px] group">
            {/* Glass Card Container */}
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:bg-white/[0.05] group-hover:border-white/20">
                
                {/* Subtle Technical Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {/* 3D Canvas */}
                <Canvas 
                    shadows 
                    camera={{ position: [0, 0, 8], fov: 35 }}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                >
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4fb6ff" />
                    
                    <Environment preset="studio" />
                    
                    <Suspense fallback={null}>
                        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                            <SpoonModel />
                        </Float>
                    </Suspense>

                    <ContactShadows 
                        position={[0, -2, 0]} 
                        opacity={0.4} 
                        scale={10} 
                        blur={2.5} 
                        far={4} 
                    />

                    <OrbitControls 
                        enableZoom={false}
                        autoRotate={true}
                        autoRotateSpeed={1}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.5}
                        makeDefault
                    />
                </Canvas>

                {/* Technical HUD minimal labels */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-1 pointer-events-none">
                    <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">Inspect View [360°]</span>
                    <span className="text-[10px] text-white/20 font-mono">SPOONERGY™ CORE_V1</span>
                </div>
                
                <div className="absolute top-6 right-6 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>
            </div>
        </div>
    );
};
