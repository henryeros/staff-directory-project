'use client'
import SlideModal from '@/components/slideModal';
import React, { useState } from 'react';
import Button from '@/components/shared/button';
import Image from 'next/image';
import editIcon from '@/assets/icons/dashboards/edit-Icon.svg';
import genderIcon from '@/assets/icons/view-employee/gender-icon.svg';
import dateofBirthIcon from '@/assets/icons/view-employee/date-of-birth-icon.svg';
import SurePromptModal from '../surePromptModal';
import EmployeeTable from '@/components/tables/employeeTable';
import InfoSection from '@/components/shared/viewInfoSections';
import AddNewDepartmentModal from '../addNewDepartmentModal';

interface ViewDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentData: any | null;
  onDepartmentUpdated?: () => void; // Callback to refresh data after edit
}

export default function ViewDepartmentModal({ 
  isOpen, 
  onClose, 
  departmentData,
  onDepartmentUpdated 
}: ViewDepartmentModalProps) {
  const [openDeactivatePrompt, setOpenDeactivatePrompt] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);

  if (!departmentData) {
    return null;
  }

  // Handle edit button click
  const handleEditClick = () => {
    setOpenEditModal(true);
  };

  // Handle close of edit modal
  const handleEditModalClose = () => {
    setOpenEditModal(false);
  };

  // Handle successful department update
  const handleDepartmentUpdated = () => {
    if (onDepartmentUpdated) {
      onDepartmentUpdated(); // Refresh parent data
    }
    setOpenEditModal(false);
    onClose(); // Also close the view modal if desired
  };

  // Prepare department data for editing
  const getDepartmentForEdit = () => {
    if (!departmentData) return undefined;
    
    return {
      id: departmentData.id,
      name: departmentData.name,
      headOfDepartment: departmentData.head, // Make sure this matches your API field
      branchDn: departmentData.branchDn // Make sure this matches your API field
    };
  };

  return (
    <>
      {/* Edit Department Modal */}
      <AddNewDepartmentModal
        isOpen={openEditModal}
        onClose={handleEditModalClose}
        initialDepartment={getDepartmentForEdit()}
        onSaved={handleDepartmentUpdated}
      />

      {/* Delete Confirmation Modal */}
      <SurePromptModal 
        isOpen={openDeactivatePrompt} 
        onClose={() => setOpenDeactivatePrompt(false)} 
        title={'Are you sure you want to delete this department?'} 
        buttonText='Delete'
        onClick={() => {}} 
      />
      
      {/* View Department Modal */}
      <SlideModal
        isOpen={isOpen}
        onClose={onClose}
          backdropzindex='z-60'
  containerzindex='z-70'
        title="Department Information"
        headerContent={
          <div className='flex flex-row justify-between items-center'>
            <p className='text-[#344054] font-medium text-[24px]'>{departmentData.name}</p>
            <Button 
              variant='primary' 
              icon={<Image src={editIcon} alt='edit-icon'/>}
              onClick={handleEditClick}
            >
              Edit
            </Button>
          </div>
        }
      >
        <div>
          <div className='min-h-[100px] bg-[#FFFFFF] rounded-[12px] p-4'>
            <InfoSection 
              image={genderIcon} 
              label={'Department Head'} 
              value={departmentData.head} 
            />
            <InfoSection 
              image={dateofBirthIcon} 
              label={'Date started'} 
              value={departmentData.dateCreated} 
            />
          </div>

          <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4 mt-4'>
            <div className='border-b border-[#D0D5DD] mb-4'>
              <p className='text-[#182230] font-medium text-[20px]'>Employee List</p>
            </div>
            {/* <EmployeeTable data={departmentData.employees} departmentEmployees /> */}
          </div>

          <div className='min-h-[60px] bg-[#FFFFFF] rounded-[12px] p-4 mt-4 flex justify-end'>
            <Button 
              variant='deactivate' 
              onClick={() => setOpenDeactivatePrompt(true)}
            >
              Delete Department
            </Button>
          </div>
        </div>
      </SlideModal>
    </>
  );
}