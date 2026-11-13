'use client';
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
import { getInventoryById } from '@/lib/services/dashboard';
import AddEditResourceModal from '../addNewResourcesModal';
import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";

interface ViewResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId?: number;
  onResourceUpdated?: () => void;
  backendPublicKey?: CryptoKey | null;
  keyPair?: CryptoKeyPair | null;
  cryptoReady?: boolean;
}

export default function ViewResourceModal({ 
  isOpen, 
  onClose, 
  resourceId, 
  onResourceUpdated,
  backendPublicKey,
  keyPair,
  cryptoReady
}: ViewResourceModalProps) {
  const [openDeactivatePrompt, setOpenDeactivatePrompt] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [resourceData, setResourceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [internalBackendPublicKey, setInternalBackendPublicKey] = useState<CryptoKey | null>(null);
  const [internalKeyPair, setInternalKeyPair] = useState<CryptoKeyPair | null>(null);
  const [internalCryptoReady, setInternalCryptoReady] = useState<boolean>(false);

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  // Initialize crypto keys if not provided via props
  useEffect(() => {
    if (backendPublicKey && keyPair && cryptoReady) {
      // Use crypto from props
      setInternalBackendPublicKey(backendPublicKey);
      setInternalKeyPair(keyPair);
      setInternalCryptoReady(true);
    } else if (!backendPublicKey && publicKeyRes?.publicKey) {
      // Initialize crypto internally
      const initializeCrypto = async (): Promise<void> => {
        try {
          const pair = await generateRSAKeyPair();
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

  console.log('ViewResourceModal props:', { isOpen, resourceId, cryptoReady: internalCryptoReady });

  // Fetch resource data when modal opens and crypto is ready
  useEffect(() => {
    console.log('useEffect triggered:', { isOpen, resourceId, cryptoReady: internalCryptoReady });
    
    if (isOpen && resourceId && internalCryptoReady && internalBackendPublicKey && internalKeyPair) {
      console.log('Fetching resource data for ID:', resourceId);
      fetchResourceData();
    } else {
      // Reset when modal closes or crypto not ready
      setResourceData(null);
      setError('');
    }
  }, [isOpen, resourceId, internalCryptoReady, internalBackendPublicKey, internalKeyPair]);

  const fetchResourceData = async () => {
    if (!resourceId || !internalCryptoReady || !internalBackendPublicKey || !internalKeyPair) {
      setError('Secure connection not ready');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('Starting encrypted API call for resource:', resourceId);
      
      const response = await getInventoryById(
        resourceId,
        internalBackendPublicKey,
        internalKeyPair
      );
      
      console.log('Encrypted API response:', response);
      
      if (response) {
        // Transform the API data to match your UI needs
        const transformedData = {
          id: response.data.id,
          name: response.data.name,
          category: response.data.category,
          brand: response.data.brand,
          serialNumber: response.data.serialNumber,
          operatingSystem: response.data.os,
          processor: response.data.processor,
          ram: response.data.ram,
          storage: response.data.storage,
        
          condition: response.data.condition,
          assignedTo: response.data.assignedTo,
          assignedToDn: response.data.assignedToDn,
          isAssigned: response.data.isAssigned,
          status: response.data.isAssigned ? 'Assigned' : 'Available'
        };
        
        console.log('Transformed data:', transformedData);
        setResourceData(transformedData);
      } else {
        throw new Error(response.description || 'Failed to fetch resource data');
      }
    } catch (err: any) {
      console.error('Error fetching resource:', err);
      setError(err?.message || 'Failed to fetch resource data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!internalCryptoReady) {
      setError('Secure connection not ready');
      return;
    }
    setOpenEditModal(true);
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
  };

  const handleResourceUpdated = () => {
    // Refresh the view data
    fetchResourceData();
    
    // Notify parent component
    if (onResourceUpdated) {
      onResourceUpdated();
    }
  };

  const handleReassignClick = () => {
    if (!internalCryptoReady) {
      setError('Secure connection not ready');
      return;
    }
    setOpenEditModal(true);
  };

  // Format data for display
  const getDisplayData = () => {
    if (!resourceData) return null;
    
    return {
      id: resourceData.id,
      name: resourceData.name,
      category: resourceData.category,
      brand: resourceData.brand,
      serialNo: resourceData.serialNumber,
      operatingSystem: resourceData.operatingSystem,
      processor: resourceData.processor,
      ram: `${resourceData.ram} GB`,
      storage: `${resourceData.storage} GB`,
      purchase: resourceData.purchaseDate ? new Date(resourceData.purchaseDate).toLocaleDateString() : 'N/A',
      condition: resourceData.condition,
      assignedTo: resourceData.assignedTo || 'Unassigned',
      status: resourceData.status
    };
  };

  const displayData = getDisplayData();

  return (
    <>
      {/* Edit Modal */}
      <AddEditResourceModal
        isOpen={openEditModal}
        onClose={handleEditClose}
        onResourceUpdated={handleResourceUpdated}
        mode="edit"
        inventoryId={resourceId?.toString()}
        initialData={resourceData}
        // backendPublicKey={internalBackendPublicKey}
        // keyPair={internalKeyPair}
        // cryptoReady={internalCryptoReady}
      />
      
      {/* Deactivate Prompt Modal */}
      <SurePromptModal 
        isOpen={openDeactivatePrompt} 
        onClose={() => setOpenDeactivatePrompt(false)} 
        title={'Are you sure you want to Deactivate this employee?'} 
        subtext={'You will be able to switch employee status'} 
        onClick={() => {}} 
        buttonText='Deactivate'
      />
      
      {/* View Modal */}
      <SlideModal
        isOpen={isOpen}
        onClose={onClose}
        title="Resource details"
        backdropzindex='z-200'
        containerzindex='z-300'
        headerContent={
          !internalCryptoReady ? (
            <div className="flex justify-center py-4 text-[#B54708]">
              Initializing secure connection...
            </div>
          ) : loading ? (
            <div className="flex justify-center py-4">Loading resource details...</div>
          ) : displayData ? (
            <div className='flex flex-row justify-between items-center'>
              <div className='flex gap-3 items-center'>
                <div>
                  <p className='text-[#344054] text-[24px] font-medium'>{displayData.name}</p>
                  <p className='text-[#475467] text-[18px] font-normal'>{displayData.serialNo}</p>
                </div>
                <div className='bg-[#F6FEF9] rounded-[8px] flex items-center justify-center gap-2 p-2'>
                  <div className={`w-2 h-2 rounded-full ${displayData.status === 'Available' ? 'bg-[#17B26A]' : 'bg-[#F04438]'}`} />
                  <p className={`${displayData.status === 'Available' ? 'text-[#17B26A]' : 'text-[#D92D20]'} font-medium text-base`}>
                    {displayData.status}
                  </p>
                </div>
              </div>
              <Button 
                variant='primary' 
                icon={<Image src={editIcon} alt='edit-icon'/>}
                onClick={handleEditClick}
                disabled={!internalCryptoReady || loading}
              >
                Edit
              </Button>
            </div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div>No resource data</div>
          )
        }
      >
        {!internalCryptoReady ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <p className="text-[#B54708] mb-4">Initializing secure connection...</p>
              <p className="text-[#475467] text-sm">Please wait while we establish a secure connection.</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Loading resource details...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <Button 
                variant="secondary" 
                onClick={fetchResourceData}
                className="mt-4"
                disabled={!internalCryptoReady}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : displayData ? (
          <div>
            <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4'>
              <div className='border-b border-[#D0D5DD] mb-4'>
                <p className='text-[#182230] font-medium text-[20px]'>Resource Information</p>
              </div>
              <InfoSection label={'Item Name'} value={displayData.name} />
              <InfoSection label={'Category'} value={displayData.category} />
              <InfoSection label={'Brand'} value={displayData.brand} />
              <InfoSection label={'Serial Number'} value={displayData.serialNo} hasClip />
              <InfoSection label={'Operating System'} value={displayData.operatingSystem} />
              <InfoSection label={'Processor'} value={displayData.processor} />
              <InfoSection label={'RAM'} value={displayData.ram} />
              <InfoSection label={'Storage'} value={displayData.storage} />
              <InfoSection label={'Purchase date'} value={displayData.purchase} />
              <InfoSection label={'Condition'} value={displayData.condition} />
            </div>

            <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4 mt-4'>
              <div className='border-b border-[#D0D5DD] mb-4'>
                <p className='text-[#182230] font-medium text-[20px]'>Assignment Information</p>
              </div>
              
              <InfoSection image={genderIcon} label={'Assigned to'} value={displayData.assignedTo} />
              <div className='flex justify-end'>
                <p 
                  className='font-medium text-[#002244] text-base underline cursor-pointer hover:opacity-70 transition-opacity'
                  onClick={handleReassignClick}
                >
                  Re-assign
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>No resource data available</p>
          </div>
        )}
      </SlideModal>
    </>
  );
}