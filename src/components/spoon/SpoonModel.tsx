import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float, Center } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const SpoonModel = ({ rotateValue, scaleValue, xValue, yValue, currentPhase, onHoverChange }: any) => {
    const { scene } = useGLTF('/bec02450-cf3d-4613-a784-0b35e03f9c18.glb');
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
        window.dispatchEvent(new CustomEvent('spoon-loaded'));
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
