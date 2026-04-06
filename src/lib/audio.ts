/**
 * LUXE SOUND ENGINE - Spoonergy™
 * Synthesized high-fidelity UI feedback sounds.
 */

type SoundType = 'tick' | 'ping' | 'success' | 'ethereal';

export const playSound = (type: SoundType) => {
    if (typeof window === 'undefined') return;

    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        
        const playOscillator = (
            freq: number, 
            type: OscillatorType = 'sine', 
            startTime: number, 
            duration: number, 
            startGain: number, 
            endGain: number,
            freqEnd?: number
        ) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            if (freqEnd) {
                osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
            }

            gain.gain.setValueAtTime(startGain, startTime);
            gain.gain.exponentialRampToValueAtTime(endGain, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const now = ctx.currentTime;

        switch (type) {
            case 'tick':
                playOscillator(1200, 'sine', now, 0.1, 0.1, 0.01, 400);
                break;
            case 'ping':
                playOscillator(800, 'sine', now, 0.3, 0.05, 0.001, 1600);
                break;
            case 'success':
                playOscillator(440, 'triangle', now, 0.6, 0.08, 0.001, 880);
                break;
            case 'ethereal':
                // --- PREMIUM SPARK & SHINE (Bell-like) ---
                // Fundamental: Pure and clear
                playOscillator(1320, 'sine', now, 1.2, 0.05, 0.0001); 
                
                // Harmonics: Creating the "Shine"
                playOscillator(2640, 'sine', now + 0.01, 0.8, 0.03, 0.0001);
                playOscillator(3960, 'sine', now + 0.02, 0.5, 0.02, 0.0001);
                
                // High Spark (The "Spark")
                playOscillator(5280, 'sine', now, 0.3, 0.015, 0.0001);
                
                // Smooth Glissando Shadow (The "Smooth")
                playOscillator(880, 'sine', now + 0.05, 1.5, 0.02, 0.0001, 440);
                break;
        }

        // Close context after sounds finish to save resources
        setTimeout(() => {
            if (ctx.state !== 'closed') ctx.close();
        }, 2000);

    } catch (e) {
        console.error('Audio engine failed:', e);
    }
};
