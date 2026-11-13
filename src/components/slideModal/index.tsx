// import React, { ReactNode } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { XCircle } from 'react-feather';

// interface SlideModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: ReactNode;
//   headerContent?: ReactNode;
//   backdropzindex?: string;
//   containerzindex?: string;
// }

// const SlideModal: React.FC<SlideModalProps> = ({ 
//   isOpen, 
//   onClose, 
//   title, 
//   children, 
//   headerContent ,
//   backdropzindex,
//   containerzindex
// }) => {
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className={`fixed inset-0 bg-black/50 bg-opacity-50 ${backdropzindex ? backdropzindex : 'z-40'} flex items-center justify-center`}
//             onClick={onClose}
//           />
//           <motion.div
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{ type: 'spring', damping: 30, stiffness: 300 }}
//             className={`fixed lg:right-6 right-0 top-0 lg:h-[96vh] h-screen lg:mt-4 mt-0 w-full lg:w-[45%] bg-[#F8F8F8] rounded-[16px] ${containerzindex ? containerzindex : 'z-50'} shadow-2xl`}
//           >
//             <div className=" bg-[#FFFFFF] px-3 rounded-t-[16px] py-3">
//               <div className='border-b border-[rgb(208,213,221)] flex flex-row justify-between items-center'>
//                 <h2 className="font-semibold text-[32px] text-[#182230]">
//                   {title}
//                 </h2>
//                 <button
//                   onClick={onClose}
//                   className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
//                 >
//                   <XCircle color='#000000' size={24} className="text-[#182230]" />
//                 </button>
//               </div>
//               {headerContent && <div className='mt-3'> {headerContent}</div>}
//             </div>
//             <div className="p-3 overflow-y-auto h-[calc(100%-88px)]">
//               {children}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default SlideModal;







import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'react-feather';

interface SlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  headerContent?: ReactNode;
  backdropzindex?: string;
  containerzindex?: string;
}

const SlideModal: React.FC<SlideModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  headerContent,
  backdropzindex,
  containerzindex
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
            className={`fixed inset-0 bg-black/50 bg-opacity-50 ${backdropzindex ? backdropzindex : 'z-40'} flex items-center justify-center`}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed lg:right-6 right-0 top-0 lg:h-[96vh] h-screen lg:mt-4 mt-0 w-full lg:w-[45%] bg-[#F8F8F8] rounded-[16px] ${containerzindex ? containerzindex : 'z-50'} shadow-2xl flex flex-col`}
          >
            {/* Header Section - Fixed */}
            <div className="bg-[#FFFFFF] px-2 rounded-t-[16px] py-4 flex-shrink-0 border-b border-[#D0D5DD]">
              <div className='flex flex-row justify-between items-center'>
                <h2 className="font-semibold text-[32px] text-[#182230]">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <XCircle color='#000000' size={24} className="text-[#182230]" />
                </button>
              </div>
              {headerContent && <div className='mt-3'>{headerContent}</div>}
            </div>
            
            {/* Content Section - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-2">
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideModal;