interface StatusBadgeProps {
  status: 'Active' | 'Inactive' | 'Available' | 'Assigned';
  variant?: 'default' | 'resources';
}

const StatusBadge = ({ status, variant = 'default' }: StatusBadgeProps) => {

  const getDotColor = () => {
    if (variant === 'resources') {
      return status === 'Available' ? 'bg-[#47CD89]' : 'bg-[#F04438]';
    }
    return status === 'Active' ? 'bg-[#47CD89]' : 'bg-[#F04438]';
  };

  return (
    <div className="flex flex-row items-center gap-2 border border-[#D0D5DD] rounded-[8px] py-2 px-2 justify-center">
      <div className={`w-2 h-2 rounded-full ${getDotColor()}`} />
      <span className='text-[#475467] font-medium text-base'>{status}</span>
    </div>
  );
};

export default StatusBadge;