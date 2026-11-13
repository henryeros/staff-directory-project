'use client'
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Clockicon from '@/assets/icons/dashboards/clock-icon.svg'
import Button from '../button';
const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  placeholder = 'Select date', 
  required = false,
  disabled = false,
  className = '',
  name 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDayClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  const handleDone = () => {
    if (selectedDate) {
      onChange(formatDate(selectedDate));
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);
    
    const days = [];
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false
      });
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayLabels.map((label, index) => (
            <div key={index} className="text-center text-[#6F7C8E] text-[15px] font-normal py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayObj, index) => {
            const isSelected = selectedDate && 
              dayObj.isCurrentMonth && 
              dayObj.day === selectedDate.getDate() &&
              currentMonth === selectedDate.getMonth() &&
              currentYear === selectedDate.getFullYear();

            return (
              <button
                key={index}
                type="button"
                onClick={() => dayObj.isCurrentMonth && handleDayClick(dayObj.day)}
                className={`
                  py-2 px-3 text-center text-[15px] font-normal rounded-[4px] transition-colors
                  ${dayObj.isCurrentMonth ? 'text-[#344054] hover:bg-[#F9FAFB]' : 'text-[#6F7C8E]'}
                  ${isSelected ? 'bg-[#002244] text-[#FFFFFF] hover:bg-[#002244]' : ''}
                  ${!dayObj.isCurrentMonth ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {dayObj.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`} ref={datePickerRef}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-[#182230] text-[16px] font-[400] mb-2"
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
            ${value ? 'text-[#182230]' : 'text-[#667085] font-[350]'}
          `}
        >
          <span>{value || placeholder}</span>
         
          <Image src={Clockicon} alt='' width={20} height={20} /> 
        </button>
        
        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-2 bg-white rounded-[8px] border border-[#F9FAFB] p-2"
            style={{
              boxShadow: '0px 4px 6px -2px #10182808, 0px 12px 16px -4px #10182814'
            }}
          >
            <div className="flex gap-2 mb-1">
              <div className="w-[70%]">
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="w-full outline-none border-none bg-[#F2F4F7] rounded-[8px] text-[16px] px-4 py-3 text-[#182230]"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="w-[30%]">
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="w-full outline-none border-none bg-[#F2F4F7] rounded-[8px] text-[16px] px-4 py-3 text-[#182230]"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {renderCalendar()}

            <div className="border-t border-[#DCE0E5] mt-4 pt-4 flex gap-3 justify-end">
            
<Button  onClick={handleCancel} variant='secondary'>Cancel</Button>
<Button  onClick={handleDone} variant='primary'>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DatePicker;