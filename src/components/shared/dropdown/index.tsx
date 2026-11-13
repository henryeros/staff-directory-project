import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Check, Search } from 'react-feather';

interface DropdownOption {
  id: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  options?: DropdownOption[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  multiSelect?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder = 'Select an option', 
  options = [],
  required = false,
  disabled = false,
  className = '',
  name,
  multiSelect = false,
  searchable = false,
  searchPlaceholder = 'Search...'
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Clear search when closing dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Focus search input when dropdown opens and searchable is enabled
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: DropdownOption) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(option.label)) {
        // Remove if already selected
        onChange(currentValues.filter(item => item !== option.label));
      } else {
        // Add to selection
        onChange([...currentValues, option.label]);
      }
    } else {
      onChange(option.label);
      setIsOpen(false);
      setSearchTerm(''); // Clear search after selection
    }
  };

  const removeSelected = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect && Array.isArray(value)) {
      onChange(value.filter(selectedItem => selectedItem !== item));
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect) {
      onChange([]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getDisplayText = () => {
    if (multiSelect && Array.isArray(value) && value.length > 0) {
      return `${value.length} selected`;
    }
    if (!multiSelect && value) {
      const selectedOption = options.find(option => option.label === value);
      return selectedOption?.label || placeholder;
    }
    return placeholder;
  };

  const isSelected = (option: DropdownOption) => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(option.label);
    }
    return value === option.label;
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
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
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full 
            outline-none 
            border-none 
            bg-[#F2F4F7] 
            rounded-[8px] 
            text-[16px]
            px-4 
            py-3
            transition-colors
            duration-200
            flex
            items-center
            justify-between
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${(multiSelect ? Array.isArray(value) && value.length > 0 : value) ? 'text-[#182230]' : 'text-[#667085] font-[350]'}
            ${multiSelect ? 'min-h-[48px]' : ''}
          `}
        >
          <div className="flex flex-wrap items-center gap-1 flex-1">
            <span>{getDisplayText()}</span>
          </div>
          {isOpen ? (
            <ChevronUp size={20} className="text-[#667085] flex-shrink-0" />
          ) : (
            <ChevronDown size={20} className="text-[#667085] flex-shrink-0" />
          )}
        </button>
        
        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-2 bg-white rounded-[8px] border border-[#F9FAFB] overflow-hidden max-h-60"
            style={{
              boxShadow: '0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814'
            }}
          >
            {/* Search Bar */}
            {searchable && (
              <div className="p-2 border-b border-[#F2F4F7]">
                <div className="relative">
                  <Search 
                    size={16} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]" 
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-8 py-2 bg-white border border-[#D0D5DD] rounded-md text-[14px] text-[#182230] placeholder-[#667085] focus:outline-none focus:ring-2 focus:ring-[#002244] focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#667085] hover:text-[#182230]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-4 py-3 text-[16px] font-normal cursor-pointer transition-colors
                      flex items-center justify-between
                      ${isSelected(option) 
                        ? 'bg-[#002244] text-white' 
                        : 'text-[#344054] hover:bg-[#F9FAFB]'
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {multiSelect && isSelected(option) && (
                      <Check size={16} className="flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-[14px] text-[#667085] text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;