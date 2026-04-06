import React from 'react';

export const WavesBackground = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0A0A0B] z-0 pointer-events-none">
            {/* The Dark Premium Mesh Gradient Orbs */}
            
            {/* 1. Silver Charcoal (Base movement) */}
            <div 
                className="absolute w-[80vw] h-[80vw] rounded-full bg-zinc-600 opacity-40 filter blur-[100px] animate-mesh-1 mix-blend-screen"
                style={{ top: '-20%', left: '-20%' }}
            />
            
            {/* 2. Warm Titanium - Premium Silver */}
            <div 
                className="absolute w-[60vw] h-[60vw] rounded-full bg-[#87877f] opacity-35 filter blur-[120px] animate-mesh-2 mix-blend-screen"
                style={{ top: '10%', right: '-10%' }}
            />

            {/* 3. Deep Void - Moves around to create shadows over the light */}
            <div 
                className="absolute w-[90vw] h-[90vw] rounded-full bg-black opacity-80 filter blur-[120px] animate-mesh-3"
                style={{ bottom: '-30%', left: '10%' }}
            />

            {/* 4. Platinum Highlights - Glow that cuts through */}
            <div 
                className="absolute w-[50vw] h-[50vw] rounded-full bg-zinc-600 opacity-30 filter blur-[90px] animate-mesh-4 mix-blend-screen"
                style={{ top: '40%', left: '40%' }}
            />

            {/* 5. Metallic Carbon - Edge shadow moving */}
            <div 
                className="absolute w-[70vw] h-[70vw] rounded-full bg-zinc-700 opacity-30 filter blur-[130px] animate-mesh-5 mix-blend-screen"
                style={{ bottom: '-10%', right: '-20%' }}
            />

            {/* Gaussian Diffuser Overlay - Reduced black tint to let silver shine */}
            <div className="absolute inset-0 backdrop-blur-[70px] bg-zinc-950/20" />

            {/* Premium Grain Texture */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" style={{ mixBlendMode: 'overlay' }}>
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>

            <style>{`
                @keyframes mesh-1 {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                    33% { transform: translate(30vw, 20vh) scale(1.2) rotate(45deg); }
                    66% { transform: translate(10vw, 40vh) scale(0.9) rotate(90deg); }
                    100% { transform: translate(0, 0) scale(1) rotate(180deg); }
                }
                @keyframes mesh-2 {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                    33% { transform: translate(-30vw, 15vh) scale(1.3) rotate(-30deg); }
                    66% { transform: translate(-45vw, -10vh) scale(0.8) rotate(-60deg); }
                    100% { transform: translate(0, 0) scale(1) rotate(-90deg); }
                }
                @keyframes mesh-3 {
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(15vw, -35vh) scale(1.1); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes mesh-4 {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                    50% { transform: translate(-25vw, 20vh) scale(1.5) rotate(15deg); }
                    100% { transform: translate(0, 0) scale(1) rotate(30deg); }
                }
                @keyframes mesh-5 {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
                    33% { transform: translate(-20vw, -30vh) scale(0.9) rotate(-45deg); }
                    66% { transform: translate(25vw, -15vh) scale(1.2) rotate(-90deg); }
                    100% { transform: translate(0, 0) scale(1) rotate(-135deg); }
                }

                .animate-mesh-1 { animation: mesh-1 25s cubic-bezier(0.25, 0.1, 0.25, 1) infinite alternate; }
                .animate-mesh-2 { animation: mesh-2 32s cubic-bezier(0.25, 0.1, 0.25, 1) infinite alternate; }
                .animate-mesh-3 { animation: mesh-3 20s cubic-bezier(0.25, 0.1, 0.25, 1) infinite alternate; }
                .animate-mesh-4 { animation: mesh-4 38s cubic-bezier(0.25, 0.1, 0.25, 1) infinite alternate; }
                .animate-mesh-5 { animation: mesh-5 29s cubic-bezier(0.25, 0.1, 0.25, 1) infinite alternate; }
            `}</style>
        </div>
    );
};
