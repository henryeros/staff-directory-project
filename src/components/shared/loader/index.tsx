import { motion } from 'framer-motion';

export default function Loader() {
 
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute top-0 left-0 w-12 h-12 rounded-full text-[#FFCC33]"
          style={{
            transform: 'rotateZ(45deg)',
            perspective: '1000px',
          }}
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-full rounded-full"
            style={{
              transformStyle: 'preserve-3d',
              rotateX: '70deg',
            }}
            variants={
               {
    animate: (custom: any) => ({
      boxShadow: [
        '0.2em 0px 0 0px currentcolor',
        '0.2em 0.2em 0 0 currentcolor',
        '0 0.2em 0 0px currentcolor',
        '-0.2em 0.2em 0 0 currentcolor',
        '-0.2em 0 0 0 currentcolor',
        '-0.2em -0.2em 0 0 currentcolor',
        '0px -0.2em 0 0 currentcolor',
        '0.2em -0.2em 0 0 currentcolor',
        '0.2em 0px 0 0px currentcolor',
      ],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
        delay: custom,
      },
    }),
  }

            }
            animate="animate"
            custom={0}
          />
          <motion.div
            className="absolute top-0 left-0 w-full h-full rounded-full text-[#002244]"
            style={{
              transformStyle: 'preserve-3d',
              rotateY: '70deg',
            }}
            variants={
               {
    animate: (custom: any) => ({
      boxShadow: [
        '0.2em 0px 0 0px currentcolor',
        '0.2em 0.2em 0 0 currentcolor',
        '0 0.2em 0 0px currentcolor',
        '-0.2em 0.2em 0 0 currentcolor',
        '-0.2em 0 0 0 currentcolor',
        '-0.2em -0.2em 0 0 currentcolor',
        '0px -0.2em 0 0 currentcolor',
        '0.2em -0.2em 0 0 currentcolor',
        '0.2em 0px 0 0px currentcolor',
      ],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
        delay: custom,
      },
    }),
  }
            }
            animate="animate"
            custom={0.4}
          />
        </motion.div>
      </div>
    </div>
  );
}