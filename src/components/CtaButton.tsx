import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { Button } from "./ui/Button";

export const CtaButton = () => {
    // We attach this component at the absolute bottom of `main` (bottom: -100vh).
    // The margin is exactly 100vh.
    
    // As the user scrolls through that margin:
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end end"]
    });

    // The container is physically scrolling up by 100vh.
    // To make the button appear "fixed" / static like the rest of the CTA section,
    // we translate it DOWN by exactly the scroll amount.
    // scrollYProgress 0 -> 0vh translated
    // scrollYProgress 1 -> 100vh translated
    // Actually, if we use a fixed element we avoid complex math, but we need it clipped!
    // Let's use simple opacity + pointer events first.
    
    const opacityRaw = useTransform(scrollYProgress, [0.0, 0.9, 1], [0, 0, 1]);
    const pointerEvents = useTransform(scrollYProgress, (val) => val > 0.99 ? "auto" : "none");

    return (
        <motion.div 
            ref={ref}
            className="fixed bottom-[25vh] left-1/2 -translate-x-1/2 z-[100]"
            style={{ opacity: opacityRaw, pointerEvents }}
        >
            <Button variant="pill">Comprar ahora</Button>
        </motion.div>
    );
}
