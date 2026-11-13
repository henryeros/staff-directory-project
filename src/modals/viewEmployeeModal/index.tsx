"use client";
import SlideModal from '@/components/slideModal';
import React, { useState, useEffect } from 'react';
import Button from '@/components/shared/button';
import Image from 'next/image';
import editIcon from '@/assets/icons/dashboards/edit-Icon.svg';
import genderIcon from '@/assets/icons/view-employee/gender-icon.svg';
import emailIcon from '@/assets/icons/view-employee/email-icon.svg';
import phoneIcon from '@/assets/icons/view-employee/phone-icon.svg';
import dateofBirthIcon from '@/assets/icons/view-employee/date-of-birth-icon.svg';
import branchIcon from '@/assets/icons/view-employee/branch-icon.svg';
import SurePromptModal from '../surePromptModal';
import InfoSection from '@/components/shared/viewInfoSections';
import { formatIOSDateToDMY } from '@/utils/helper';
import { getSingleEmployee, type SingleEmployeeRow } from '@/lib/services/dashboard';
import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";
import EditEmployeeModal from '../editEmployeeModal';
import Loader from '@/components/shared/loader';
import linkIcon from '@/assets/icons/dashboards/digital-card-link.svg'
import { generateQR } from '@/lib/services/dashboard';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from '@/lib/apiClient';
import Input from '@/components/shared/input';
import { getAccessToken } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: any | null;
  backendPublicKey?: CryptoKey | null;
  keyPair?: CryptoKeyPair | null;
  cryptoReady?: boolean;
}

// QR Code Modal Component
const QRCodeModal = ({ isOpen, onClose, qrCodeBase64, employeeName, employeeDn }: { 
  isOpen: boolean; 
  onClose: () => void; 
  qrCodeBase64: string; 
  employeeName: string;
  employeeDn: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Digital Card QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">QR Code for {employeeName}</p>
          <div className="flex justify-center mb-6">
            <img 
              src={`${qrCodeBase64}`} 
              alt="QR Code" 
              className="w-64 h-64 border border-gray-200 rounded-lg"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <Input 
              value={`http://10.4.1.8:7008/users?dn=${employeeDn}`} 
              onChange={() => {}} 
           
              className="text-center"
            />
     
          </div>
        </div>
      </div>
    </div>
  );
};

const getInitials = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
};

export default function ViewEmployeeModal({ 
  isOpen, 
  onClose, 
  employeeData,
  backendPublicKey,
  keyPair,
  cryptoReady
}: ViewEmployeeModalProps) {
  const router = useRouter();
 const token = getAccessToken()
  const [openDeactivatePrompt, setOpenDeactivatePrompt] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [openQRModal, setOpenQRModal] = useState<boolean>(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('');
  const [detailedEmployeeData, setDetailedEmployeeData] = useState<SingleEmployeeRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [internalBackendPublicKey, setInternalBackendPublicKey] = useState<CryptoKey | null>(null);
  const [internalKeyPair, setInternalKeyPair] = useState<CryptoKeyPair | null>(null);
  const [internalCryptoReady, setInternalCryptoReady] = useState<boolean>(false);

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return Cookies.get("access_token") ?? null;
  }

  // Get employee DN/identifier
  const getEmployeeDn = (): string => {
    if (!employeeData) return '';
    
    if (typeof employeeData === 'string') {
      return employeeData;
    } else if (employeeData.dn) {
      return employeeData.dn;
    } else if (employeeData.email) {
      return employeeData.email;
    } else {
      return '';
    }
  };

  const employeeDn = getEmployeeDn();

  useEffect(() => {
    if (backendPublicKey && keyPair && cryptoReady) {
      setInternalBackendPublicKey(backendPublicKey);
      setInternalKeyPair(keyPair);
      setInternalCryptoReady(true);
    } else if (!backendPublicKey && publicKeyRes?.publicKey) {
      const initializeCrypto = async (): Promise<void> => {
        try {
          const pair = await generateRSAKeyPair();
          //@ts-ignore
          setInternalKeyPair(pair);
          const pem = publicKeyRes.publicKey.replace(/\r\n/g, "\n").trim();
          const backendKey = await importPublicKey(pem);
          setInternalBackendPublicKey(backendKey);
          setInternalCryptoReady(true);
        } catch (err) {
          console.error("Failed to initialize crypto:", err);
          setError("Failed to initialize secure connection. Please refresh.");
        }
      };
      initializeCrypto();
    }
  }, [backendPublicKey, keyPair, cryptoReady, publicKeyRes]);

  useEffect(() => {
    if (isOpen && employeeData && internalCryptoReady && internalBackendPublicKey && internalKeyPair) {
      fetchEmployeeDetails();
    } else {
      setDetailedEmployeeData(null);
      setError('');
    }
  }, [isOpen, employeeData, internalCryptoReady, internalBackendPublicKey, internalKeyPair]);

  const fetchEmployeeDetails = async () => {
    console.log({ dn: employeeDn }, 'payload')
    if (!employeeData || !internalCryptoReady || !internalBackendPublicKey || !internalKeyPair) {
      setError('Secure connection not ready or no employee data');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // const response = await getSingleEmployee({ dn: employeeDn }, internalBackendPublicKey, internalKeyPair);

//     const response = await axios.post(`http://10.4.1.8:4433/api/v1/users/get-user`, {
//   dn: employeeDn 
// }, {
//   headers: {
//     'Admin': 'TatumBank-X-Environment'
//   }
// })
const response = await axios.post(
  `http://10.4.1.8:4433/api/v1/users/get-user`,
  { dn: employeeDn },
  {
    headers: {
      'Admin': 'TatumBank-X-Environment',
      'Authorization': `Bearer ${token}`
    }
  }
);
console.log(response, 'get details')

if (response.status == 401) {
  
     Cookies.remove('access_token');
      Cookies.remove('user');
      router.push('/login');
} else {
 if (response) {
        setDetailedEmployeeData(response.data.data);
      } else {
        throw new Error( 'Failed to fetch employee details');
      }
}


     
    } catch (err: any) {
      console.error('Error fetching employee details:', err);
      if (err.status == 401) {
     Cookies.remove('access_token');
      Cookies.remove('user');
      router.push('/login');
      } else {
  setError(err?.message || 'Failed to fetch employee details');
      }
    
    } finally {
      setLoading(false);
    }
  };

  const generateQRFunction = async () => {
    if (!employeeData) {
      setError('No employee data available');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get access token
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Prepare payload
      const payload = {
        url: `http://10.4.1.8:7008/users?dn=${employeeDn}`
      };

      // Make direct axios POST request
      const response = await axios.post(
        `${BASE_URL}/qr/generate`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.data && response.data.data.qrCodeBase64) {
        const qrCodeBase64 = response.data.data.qrCodeBase64;
        setQrCodeBase64(qrCodeBase64);
        setOpenQRModal(true);
      } else {
        throw new Error('Invalid response format from QR generation service');
      }
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError(err?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setOpenEditModal(true);
  };

  const handleEmployeeUpdated = () => {
    fetchEmployeeDetails();
    setOpenEditModal(false);
  };

  const displayData = detailedEmployeeData ? {
    fullName: detailedEmployeeData.displayName,
    jobTitle: detailedEmployeeData.jobTitle,
    department: detailedEmployeeData.department,
    startDate: detailedEmployeeData.startDate,
    status: detailedEmployeeData.isActive ? 'Active' : 'Inactive' as 'Active' | 'Inactive',
    sex: detailedEmployeeData.gender,
    email: detailedEmployeeData.email,
    phone: detailedEmployeeData.phoneNumber,
    dateOfBirth: detailedEmployeeData.dateOfBirth,
    branch: detailedEmployeeData.branch || 'N/A',
    employmentType: detailedEmployeeData.employmentType,
    salary: 'N/A',
    address: detailedEmployeeData.address || 'N/A',
    emergencyContact: detailedEmployeeData.emergencyContact || 'N/A',
    dn: detailedEmployeeData.dn
  } : null;

  const initials = displayData ? getInitials(displayData.fullName) : '';

  return (
    <>
      <SurePromptModal 
        isOpen={openDeactivatePrompt} 
        onClose={() => setOpenDeactivatePrompt(false)} 
        title={'Are you sure you want to Deactivate this employee?'} 
        subtext={'You will be able to switch employee status'} 
        onClick={() => {}} 
        buttonText='Deactivate'
      />

      <EditEmployeeModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onEmployeeUpdated={handleEmployeeUpdated}
        employeeData={displayData}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={openQRModal}
        onClose={() => setOpenQRModal(false)}
        qrCodeBase64={qrCodeBase64}
        employeeName={displayData?.fullName || 'Employee'}
        employeeDn={employeeDn}
      />

      <SlideModal
        isOpen={isOpen}
        onClose={onClose}
        title="Employee details"
        headerContent={
          loading ? (
            <Loader />
          ) : displayData ? (
            <div className='flex flex-row justify-between items-center'>
              <div className='flex gap-3 items-center'>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-medium text-lg" style={{ backgroundColor: '#002244' }}>
                  {initials}
                </div>
                <div>
                  <p className='text-[#344054] text-[24px] font-medium'>{displayData.fullName}</p>
                  <p className='text-[#475467] text-[18px] font-normal'>{displayData.jobTitle}</p>
                </div>
                <div className={`${displayData.status == 'Active' ? 'bg-[#F6FEF9]' : 'bg-[#fbbaba]'}  rounded-[8px]  flex items-center justify-center gap-2 p-2`}>
                  <div className={`w-2 h-2 rounded-full ${displayData.status == 'Active' ? 'bg-[#17B26A] text-[#17B26A]' : 'bg-[#F04438] text-red-500'}`} />
                  <p className={`font-medium text-base ${displayData.status == 'Active' ? ' text-[#17B26A]' : ' text-red-500'}`}>{displayData.status}</p>
                </div>
              </div>
              <div className='flex flex-row gap-2'>
                <Button variant='secondary' icon={<Image src={linkIcon} alt='edit-icon'/>} onClick={generateQRFunction} disabled={!internalCryptoReady || loading}>
                  Digital Card Link
                </Button>
                <Button variant='primary' icon={<Image src={editIcon} alt='edit-icon'/>} onClick={handleEditClick} disabled={!internalCryptoReady || loading}>
                  Edit
                </Button>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div>No employee data</div>
          )
        }
      >
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Loading employee details...</p>
          </div>
        ) : displayData ? (
          <div>
            <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4'>
              <div className='border-b border-[#D0D5DD] mb-4'>
                <p className='text-[#182230] font-medium text-[20px]'>Personal Information</p>
              </div>
              <InfoSection image={genderIcon} label={'Gender'} value={displayData.sex} />
              <InfoSection hasClip image={emailIcon} label={'Email'} value={displayData.email} under={displayData?.email?.length > 10} />
              <InfoSection image={phoneIcon} label={'Phone number'} value={displayData.phone} />
              <InfoSection image={dateofBirthIcon} label={'Date of birth'} value={formatIOSDateToDMY(displayData.dateOfBirth)} />
            </div>

            <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4 mt-4'>
              <div className='border-b border-[#D0D5DD] mb-4'>
                <p className='text-[#182230] font-medium text-[20px]'>Employment Information</p>
              </div>
              <InfoSection image={branchIcon} label={'Branch'} value={displayData.branch} />
              <InfoSection image={genderIcon} label={'Department'} value={displayData.department} />
              <InfoSection image={genderIcon} label={'Job title'} value={displayData.jobTitle} />
              <InfoSection image={genderIcon} label={'Employment Type'} value={displayData.employmentType} />
              <InfoSection image={dateofBirthIcon} label={'Start date'} value={formatIOSDateToDMY(displayData.startDate)} />
            </div>

            <div className='min-h-[60px] bg-[#FFFFFF] rounded-[12px] p-4 mt-4 flex justify-end'>
              <Button variant='deactivate' className='cursor-pointer' onClick={() => setOpenDeactivatePrompt(true)} disabled={!internalCryptoReady || loading}>
                Deactivate Employee
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>No employee data available</p>
          </div>
        )}
      </SlideModal>
    </>
  );
}