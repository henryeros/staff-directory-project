import EmptyPageImage from '@/assets/icons/dashboards/empty.svg';
import Image from 'next/image';
import Button from '../shared/button';
import { Plus } from 'react-feather';

interface EmptyPageProps {
  header: string;
  buttonText: string;
  onClick: () => void;
  showButton?: boolean;

}

export default function EmptyPage({ header, buttonText, onClick, showButton=true }: EmptyPageProps) {
  return (
    <div className='flex flex-col items-center justify-center text-center'>
      <Image 
        src={EmptyPageImage} 
        alt="No Data" 
        className="mx-auto my-6"
      />
      <p className='text-[#182230] text-[22px] font-medium'>{header}</p>
      {
        showButton && (
  <Button 
        variant="primary" 
        className='mt-4' 
        onClick={onClick} 
        icon={<Plus size={20} color={'#002244'}/>}
      >
        {buttonText}
      </Button>
        )
      }
    
    </div>
  );
}