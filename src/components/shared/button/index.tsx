import React from 'react';
import { Loader } from 'react-feather';
import { motion, AnimatePresence } from 'framer-motion';
import { ButtonProps, ButtonVariant } from '../../../types/buttonTypes';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  onClick,
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = `
    cursor-pointer
    inline-flex items-center justify-center
    px-4 py-3
    text-base font-medium
    rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:bg-[#F2F4F7] disabled:text-[#667085]
    min-h-[40px]
    border
  `;

  const variantClasses: Record<ButtonVariant, string> = {
    primary: `
      bg-[#FFCC33]
      text-[#002244]
      hover:bg-[#e6b82e]
      focus:ring-[#FFCC33]
      border border-transparent
    `,
    secondary: `
      border border-[#D0D5DD]
      text-[#667085]
      bg-transparent
      hover:bg-gray-50
      focus:ring-gray-300
    `,
    danger: `
      bg-[#F04438]
      text-[#FFFFFF]
      hover:bg-[#e03a2f]
      focus:ring-[#F04438]
      border border-transparent
    `,
    deactivate: `
      bg-[#FECDCA]
      text-[#D92D20]
      hover:bg-[#fdbcb8]
      focus:ring-[#FECDCA]
      border border-transparent
    `,
    activate: `
      bg-[#ECFDF3]
      text-[#17B26A]
      hover:bg-[#d9f7e6]
      focus:ring-[#ECFDF3]
      border border-transparent
    `,
  };

  const buttonClass = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${isLoading ? 'cursor-wait' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Animation variants for the dots
  const dotVariants = {
    initial: { y: 0 },
    animate: { 
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "loop" as const,
      }
    },
  };

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader className="animate-spin mr-2 h-4 w-4" />
          <span className="flex items-center">
            Loading
            <AnimatePresence mode="wait">
              <motion.span
                key="dots"
                className="flex"
                initial="initial"
                animate="animate"
              >
                <motion.span
                  variants={dotVariants}
                  custom={0}
                  style={{ animationDelay: '0s' }}
                >
                  .
                </motion.span>
                <motion.span
                  variants={dotVariants}
                  custom={1}
                  style={{ animationDelay: '0.2s' }}
                >
                  .
                </motion.span>
                <motion.span
                  variants={dotVariants}
                  custom={2}
                  style={{ animationDelay: '0.4s' }}
                >
                  .
                </motion.span>
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      ) : (
        <>
          {icon && React.cloneElement(icon, { className: `mr-2 h-4 w-4 ${icon.props.className || ''}` })}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;