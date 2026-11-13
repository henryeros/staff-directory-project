"use client";
import Image from "next/image";
import clipIcon from '@/assets/icons/view-employee/clip-icon.svg';
import { useToast } from "../toast";

interface InfoSectionProps {
  image?: string;
  label: string;
  value: string;
  hasClip?: boolean;
  under?: boolean;
}

const InfoSection = ({ image, label, value, hasClip, under }: InfoSectionProps) => {
  const { show } = useToast();

  const handleCopyToClipboard = async () => {
    if (!value || value === 'NIL') return;

    try {
      await navigator.clipboard.writeText(value);
      show({
        type: "success",
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard`,
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      show({
        type: "error",
        title: "Copy failed",
        description: "Failed to copy text to clipboard",
        duration: 3000,
      });
    }
  };

  if (under) {
    return (
      <div className='flex flex-col gap-2 my-4'>
        <div className='flex flex-row items-center gap-3'>
          {image && (  
            <Image src={image} alt={label} width={26} height={26}/>
          )}
          <p className='font-normal text-[#475467] text-[20px]'>{label}</p>
        </div>

        <div className='flex flex-row items-center gap-2 pl-9'>
          <p className='text-[#182230] text-[20px] font-medium'>{value || 'NIL'}</p>
          {hasClip && value && value !== 'NIL' && (
            <button 
              onClick={handleCopyToClipboard}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={`Copy ${label} to clipboard`}
            >
              <Image src={clipIcon} width={16} height={16} alt='Copy to clipboard' className='cursor-pointer' />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-row items-center justify-between my-4'>
      <div className='flex flex-row items-center gap-3'>
        {image && (  
          <Image src={image} alt={label} width={26} height={26}/>
        )}
        <p className='font-normal text-[#475467] text-[20px]'>{label}</p>
      </div>

      <div className='flex flex-row items-center gap-2'>
        <p className='text-[#182230] text-[20px] font-medium'>{value || 'NIL'}</p>
        {hasClip && value && value !== 'NIL' && (
          <button 
            onClick={handleCopyToClipboard}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={`Copy ${label} to clipboard`}
          >
            <Image src={clipIcon} width={16} height={16} alt='Copy to clipboard' className='cursor-pointer' />
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoSection;