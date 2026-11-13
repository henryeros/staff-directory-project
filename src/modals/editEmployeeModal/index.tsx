// EditEmployeeModal.tsx
"use client";
import SlideModal from '@/components/slideModal';
import Input from '@/components/shared/input';
import Dropdown from '@/components/shared/dropdown';
import DatePicker from '@/components/shared/datePicker';
import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/shared/imageUploader';
import Button from '@/components/shared/button';
import { Check } from 'react-feather';
import { updateUser, type EditUserPayload } from '@/lib/services/dashboard';
import { formatDateForAPI } from '@/utils/helper';
import { getBranches, getDepartments, type BranchRow, type DepartmentRow } from '@/lib/services/dashboard';
import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated?: () => void;
  employeeData: any | null;
}

function dnToBranchLabel(dn: string): string {
  if (!dn) return "";
  const firstPart = dn.split(",")[0];
  const label = firstPart.replace(/^OU=/i, "");
  return label || dn;
}

export default function EditEmployeeModal({
  isOpen,
  onClose,
  onEmployeeUpdated,
  employeeData,
}: EditEmployeeModalProps) {
  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [cryptoReady, setCryptoReady] = useState<boolean>(false);

  const [genderValue, setGenderValue] = useState<string>('');
  const [dateOfBirthValue, setDateOfBirthValue] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [branchValue, setBranchValue] = useState<string>('');
  const [selectedBranchDn, setSelectedBranchDn] = useState<string>('');
  const [departmentValue, setDepartmentValue] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [employmentTypeValue, setEmploymentTypeValue] = useState<string>('');
  const [startDateValue, setStartDateValue] = useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [branchOptions, setBranchOptions] = useState<{ id: string; label: string; dn: string }[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ id: string; label: string; departmentId: number }[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMetaLoading, setIsMetaLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  const genderOptions = [
    { id: 'Male', label: 'Male' },
    { id: 'Female', label: 'Female' },
  ];

  const employmentOptions = [
    { id: 'Full-time', label: 'Full-time', value: 'Full-time' },
    { id: 'Part-time', label: 'Part-time', value: 'Part-time' },
    { id: 'Contract', label: 'Contract', value: 'Contract' },
    { id: 'Freelance', label: 'Freelance', value: 'Freelance' },
  ];

  useEffect(() => {
    if (!publicKeyRes || !publicKeyRes.publicKey) return;

    const initializeCrypto = async (): Promise<void> => {
      try {
        const pair = await generateRSAKeyPair();
        setKeyPair(pair);
        const pem = publicKeyRes.publicKey.replace(/\r\n/g, "\n").trim();
        const backendKey = await importPublicKey(pem);
        setBackendPublicKey(backendKey);
        setCryptoReady(true);
      } catch (err) {
        console.error("Failed to initialize crypto:", err);
        setErrorMessage("Failed to initialize secure connection. Please refresh.");
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  useEffect(() => {
    if (employeeData && isOpen) {
      populateFormWithEmployeeData();
    }
  }, [employeeData, isOpen]);

  useEffect(() => {
    if (!isOpen || !cryptoReady || !backendPublicKey || !keyPair) return;

    const loadMeta = async () => {
      try {
        setIsMetaLoading(true);
        setErrorMessage('');

        const branchesRes = await getBranches({}, backendPublicKey, keyPair);
        if (branchesRes) {
          const bOpts = branchesRes.data.map((b: BranchRow, idx: number) => {
            const humanLabel = b.name?.trim() ? b.name.trim() : dnToBranchLabel(b.dn);
            return { id: String(idx + 1), label: humanLabel, dn: b.dn };
          });
          setBranchOptions(bOpts);
        } else {
          setErrorMessage(`Failed to load branches: ${branchesRes.description}`);
        }

        const departmentsRes = await getDepartments({ PageNumber: 1, PageSize: 200 }, backendPublicKey, keyPair);
        if (departmentsRes) {
          const dOpts = departmentsRes.data.map((d: DepartmentRow) => ({
            id: String(d.id),
            label: d.name,
            departmentId: d.id,
          }));
          setDepartmentOptions(dOpts);
        } else {
          setErrorMessage(`Failed to load departments: ${departmentsRes.description}`);
        }
      } catch (err: any) {
        console.error("Failed to load branches/departments:", err);
        setErrorMessage("Failed to load branches/departments. Please try again.");
      } finally {
        setIsMetaLoading(false);
      }
    };

    loadMeta();
  }, [isOpen, cryptoReady, backendPublicKey, keyPair]);

  const populateFormWithEmployeeData = () => {
    if (!employeeData) return;

    setFirstName(employeeData.firstname || employeeData.fullName?.split(' ')[0] || '');
    setSurname(employeeData.surname || employeeData.fullName?.split(' ').slice(1).join(' ') || '');
    setWorkEmail(employeeData.email || '');
    setMobileNumber(employeeData.phoneNumber || '');
    setGenderValue(employeeData.gender || '');
    setDateOfBirthValue(employeeData.dateOfBirth || '');
    setBranchValue(employeeData.branch || '');
    setDepartmentValue(employeeData.department || '');
    setDepartmentId(employeeData.departmentId || 0);
    setJobTitle(employeeData.jobTitle || '');
    setEmploymentTypeValue(employeeData.employmentType || '');
    setStartDateValue(employeeData.startDate || '');
  };

  const handleImageChange = (file: File | null) => {
    setProfileImage(file);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentValue(value);
    const selectedDept = departmentOptions.find((opt) => opt.label === value || opt.id === value);
    setDepartmentId(selectedDept?.departmentId || 0);
  };

  const handleBranchChange = (value: string) => {
    const selectedBranch = branchOptions.find((opt) => opt.label === value || opt.id === value);
    if (selectedBranch) {
      setBranchValue(selectedBranch.label);
      setSelectedBranchDn(selectedBranch.dn);
    } else {
      setBranchValue(value);
      setSelectedBranchDn('');
    }
  };

  const handleEmploymentTypeChange = (value: string) => {
    setEmploymentTypeValue(value);
  };

  const handleGenderChange = (value: string) => {
    setGenderValue(value);
  };

  const resetForm = () => {
    setFirstName('');
    setSurname('');
    setWorkEmail('');
    setMobileNumber('');
    setGenderValue('');
    setDateOfBirthValue('');
    setBranchValue('');
    setSelectedBranchDn('');
    setDepartmentValue('');
    setDepartmentId(0);
    setJobTitle('');
    setEmploymentTypeValue('');
    setStartDateValue('');
    setProfileImage(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!firstName || !surname || !workEmail || !jobTitle || !startDateValue) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (!cryptoReady || !backendPublicKey || !keyPair) {
      setErrorMessage('Secure connection not ready. Please wait or refresh.');
      return;
    }

    if (!selectedBranchDn || departmentId === 0) {
      setErrorMessage('Please select both branch and department');
      return;
    }

    if (!employeeData?.dn) {
      setErrorMessage('No employee data available for update');
      return;
    }

    setIsLoading(true);

    try {
      const payload: EditUserPayload = {
        firstname: firstName.trim(),
        surname: surname.trim(),
        email: workEmail.trim(),
        phoneNumber: mobileNumber.trim(),
        dateOfBirth: dateOfBirthValue ? formatDateForAPI(dateOfBirthValue) : new Date().toISOString(),
        gender: genderValue,
        jobTitle: jobTitle.trim(),
        startDate: formatDateForAPI(startDateValue),
        branch: branchValue,
        department: departmentValue,
        departmentId: departmentId,
        employmentType: employmentTypeValue,
        dn: employeeData.dn,
      };

      console.log(payload)

      const response = await updateUser(payload, backendPublicKey, keyPair);

      if (response) {
        setSuccessMessage('Employee updated successfully!');
        setTimeout(() => {
          resetForm();
          onClose();
          if (onEmployeeUpdated) onEmployeeUpdated();
        }, 1500);
      } else {
        if (response.errors && response.errors.length > 0) {
          const errorMsg = response.errors.map((error) => `${error.field}: ${error.description}`).join(', ');
          setErrorMessage(`Failed to update employee: ${errorMsg}`);
        } else {
          setErrorMessage(response.description || 'Failed to update employee');
        }
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while updating the employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlideModal backdropzindex='z-400' containerzindex='z-500' isOpen={isOpen} onClose={handleCancel} title="Edit Employee">
      <div>
        {!cryptoReady && (
          <div className="mb-4 rounded-md border border-[#FEF0C7] bg-[#FFFAEB] p-3 text-sm text-[#B54708]">
            Initializing secure connection...
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-md border border-[#FEE4E2] bg-[#FEF3F2] p-4 text-sm text-[#B42318]">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md border border-[#D1FADF] bg-[#ECFDF3] p-4 text-sm text-[#027A48]">
            {successMessage}
          </div>
        )}

        <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4'>
          <div className='border-b border-[#D0D5DD] mb-4'>
            <p className='text-[#182230] font-medium text-[20px]'>Personal Information</p>
          </div>

          <ImageUploader value={profileImage} onChange={handleImageChange} />

          <div className='flex lg:flex-row flex-col gap-4 mt-4'>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} label="First Name" placeholder="Enter first name" required disabled={isLoading} />
            <Input value={surname} onChange={(e) => setSurname(e.target.value)} label="Surname" placeholder="Enter surname" required disabled={isLoading} />
          </div>

          <div className='flex lg:flex-row flex-col gap-4 mt-4'>
            <Dropdown label="Gender" value={genderValue} onChange={handleGenderChange} placeholder="Choose from the list" options={genderOptions} required name="gender" disabled={isLoading} />
            <DatePicker label="Date of Birth" value={dateOfBirthValue} onChange={setDateOfBirthValue} placeholder="DD/MM/YYYY" name="date-of-birth" disabled={isLoading} />
          </div>

          <div className='flex lg:flex-row flex-col gap-4 mt-4'>
            <Input value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} label="Work email" placeholder="Enter work email" type="email" required disabled={isLoading} />
            <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} label="Mobile number" placeholder="Enter phone number" type="tel" disabled={isLoading} />
          </div>
        </div>

        <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4 mt-4'>
          <div className='border-b border-[#D0D5DD] mb-4'>
            <p className='text-[#182230] font-medium text-[20px]'>Employment Information</p>
          </div>

          <Dropdown label="Branch" value={branchValue} onChange={handleBranchChange} placeholder={isMetaLoading ? "Loading branches..." : "Select branch"} options={branchOptions.map((b) => ({ id: b.id, label: b.label }))} name="branch" disabled={isLoading || isMetaLoading} />

          <div className='flex lg:flex-row flex-col gap-4 mt-4'>
            <Dropdown label="Department" value={departmentValue} onChange={handleDepartmentChange} placeholder={isMetaLoading ? "Loading departments..." : "Select department"} options={departmentOptions.map((d) => ({ id: d.id, label: d.label }))} name="department" disabled={isLoading || isMetaLoading} />
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} label="Job title" placeholder="Enter job title" required disabled={isLoading} />
          </div>

          <div className='flex lg:flex-row flex-col gap-4 mt-4'>
            <Dropdown label="Employment type" value={employmentTypeValue} onChange={handleEmploymentTypeChange} placeholder="Select employment type" options={employmentOptions} name="employment-type" disabled={isLoading} />
            <DatePicker label="Start date" value={startDateValue} onChange={setStartDateValue} placeholder="Start date" required name="start-date" disabled={isLoading} />
          </div>
        </div>

        <div className='flex justify-end items-center gap-4 mt-6'>
          <button onClick={handleCancel} className='text-[#F04438] text-base cursor-pointer font-medium hover:text-[#d0382c] transition-colors' disabled={isLoading}>Cancel</button>
          <Button variant='primary' icon={<Check color='#002244' />} onClick={handleSubmit} disabled={isLoading || isMetaLoading || !cryptoReady}>
            {isLoading ? 'Updating Employee...' : 'Update Employee'}
          </Button>
        </div>
      </div>
    </SlideModal>
  );
}