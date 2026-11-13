import React, { useState } from 'react';
import { Eye, EyeOff } from 'react-feather';
import { InputProps } from '../../../types/inputTypes';

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  name,
  icon,
  rightIcon, // New prop for right-side icon
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Calculate padding based on icon positions
  const getInputPadding = () => {
    if (icon && type === 'password') return 'pl-10 pr-12';
    if (icon && rightIcon) return 'pl-10 pr-12';
    if (icon) return 'pl-10 pr-4';
    if (type === 'password' || rightIcon) return 'pl-4 pr-12';
    return 'pl-4 pr-4';
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-[#182230] text-[16px] font-[400] mb-3"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full 
            outline-none 
            border-none 
            bg-[#F2F4F7] 
            rounded-[8px] 
            placeholder:text-[#667085] 
            placeholder:font-[350] 
            placeholder:text-[16px]
            text-[16px]
            text-[#182230]
            ${getInputPadding()}
            py-3
            transition-colors
            duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        
        {/* Right-side content */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Custom right icon */}
          {rightIcon && !(type === 'password') && (
            <div className="text-[#667085]">
              {rightIcon}
            </div>
          )}
          
          {/* Password visibility toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-[#667085] hover:text-[#182230] transition-colors duration-200"
              disabled={disabled}
            >
              {showPassword ? (
                <Eye size={20} />
              ) : (
                <EyeOff size={20} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;