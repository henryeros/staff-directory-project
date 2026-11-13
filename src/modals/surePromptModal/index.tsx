import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import CancelModalIcon from '@/assets/icons/view-employee/cancel-modal-icon.svg'
import Button from '@/components/shared/button';

interface SurePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtext?: React.ReactNode;
  onClick: () => void;
  buttonText?: string;
}

const SurePromptModal: React.FC<SurePromptModalProps> = ({
  isOpen,
  onClose,
  title,
  subtext,
  onClick,
  buttonText
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-90 flex items-center justify-center"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:w-[40%] w-full bg-[#F8F8F8] rounded-[16px] z-100 shadow-2xl"
          >
            <div className="p-4 min-h-[300px] flex flex-col justify-center items-center text-center">
                <Image src={CancelModalIcon} alt='cancel-icon' />
              <div className="mt-3 text-[#182230] text-[24px] font-medium">
                {title}
              </div>
              <div className="mb-6">
                {subtext}
              </div>
              
              <div className="flex justify-between  w-full ">
                <Button variant='secondary' onClick={onClose} className='w-[49%]'>Cancel</Button>
                <Button variant='danger' onClick={onClick} className='w-[49%]'>{buttonText}</Button>
               
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SurePromptModal;