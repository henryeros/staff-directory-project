'use client'
import { motion } from 'framer-motion'
import Image from "next/image"

export default function DashboardSummeryCard({ data, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative min-h-[100px] bg-white rounded-lg border border-[#EAECF0] shadow-sm p-3 cursor-pointer overflow-hidden"
    >
      {/* Animated background circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: index * 0.1 + 0.2,
          ease: "easeOut"
        }}
        className="absolute top-0 right-0"
      >
        <Image
          src={data.bgIcon}
          alt="background circle"
          className="w-auto h-auto"
        />
      </motion.div>

      {/* Icon with fade in from down animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1 + 0.2,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.1,
          transition: { duration: 0.3 }
        }}
      >
        <Image
          src={data.icon}
          alt="icon"
          className="w-auto h-auto"
        />
      </motion.div>

      {/* Value with counting animation effect */}
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1 + 0.4,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className='text-[#002244] font-medium text-[24px] mt-4 mb-2 relative z-10'
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
        >
          {data.value}
        </motion.span>
      </motion.p>

      {/* Title with slide animation */}
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1 + 0.5,
          ease: "easeOut"
        }}
        className='text-[#344054] text-base font-normal relative z-10'
      >
        {data.title}
      </motion.p>

      {/* Hover effect overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-br from-[#002244]/5 to-transparent rounded-lg pointer-events-none"
      />
    </motion.div>
  )
}