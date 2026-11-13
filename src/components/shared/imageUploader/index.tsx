import { useState, useRef, ChangeEvent } from 'react';
import Button from '../button';
import { UploadCloud } from 'react-feather';

interface ImageUploaderProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  buttonText?: string;
}

export default function ImageUploader({ value, onChange, buttonText }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      if (onChange) {
        onChange(file);
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex justify-between items-end w-full">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
        previewUrl ? 'bg-transparent' : 'bg-[#D9D9D9]'
      }`}>
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full rounded-full object-cover"
          />
        )}
      </div>

      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button className='text-base' onClick={handleButtonClick} variant='secondary' icon={<UploadCloud color='#667085' />}>{buttonText || 'Upload New Image'}</Button>
      
      </div>
    </div>
  );
}