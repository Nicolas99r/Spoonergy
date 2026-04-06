import { motion } from "framer-motion";

export const TextReveal = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={item} className="inline-block mr-[0.3em]">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};
