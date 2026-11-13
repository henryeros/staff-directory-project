//@ts-ignore
//@ts-nocheck
'use client';

import SlideModal from '@/components/slideModal';
import Input from '@/components/shared/input';
import Dropdown from '@/components/shared/dropdown';
import DatePicker from '@/components/shared/datePicker';
import React, { useState, useMemo, useEffect } from 'react';
import Button from '@/components/shared/button';
import { Check, Loader } from 'react-feather';

import { 
  createInventory, 
  updateInventory, 
  getInventoryById,
  type CreateInventoryPayload,
  getUsers,
  type InventoryRow 
} from '@/lib/services/dashboard'; // Updated import path

import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";

// Define the user type based on your API response
interface IUser {
  username: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string;
  gender: string | null;
  jobTitle: string;
  startDate: string;
  accountCreationDate: string;
  department: string;
  employmentType: string | null;
  dn: string;
  isActive: boolean;
  token: string | null;
  tokenExpiry: string;
  userType: string;
}

// Define inventory type based on your API
export interface IInventory {
  id?: string;
  name: string;
  category: string;
  brand: string;
  serialNumber: string;
  os: string;
  processor: string;
  ramGb: number;
  storageGb: number;
  condition: string;
  assignedTo: string;
  assignedToDn: string;
  purchaseDate: string;
  assignedDate?: string;
  isAssigned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AddEditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResourceCreated?: () => void;
  onResourceUpdated?: () => void;
  mode?: 'create' | 'edit';
  inventoryId?: string | null;
  initialData?: Partial<IInventory>;
}

export default function AddEditResourceModal({
  isOpen,
  onClose,
  onResourceCreated,
  onResourceUpdated,
  mode = 'create',
  inventoryId = null,
  initialData,
}: AddEditResourceModalProps) {
  // ---------- encryption state ----------
  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [cryptoReady, setCryptoReady] = useState<boolean>(false);

  // ---------- form state ----------
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    brand: '',
    serialNumber: '',
    operatingSystem: '',
    processor: '',
    ram: '',
    storage: '',
    purchaseDate: '',
    condition: '',
    assignedTo: '',
    assignedToDn: '',
  });

  // ---------- employees dropdown state ----------
  const [employeeOptions, setEmployeeOptions] = useState<
    { id: string; label: string; dn: string }[]
  >([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // ---------- UI state ----------
  const [submitting, setSubmitting] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [error, setError] = useState('');

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  // ---------- static dropdowns ----------
  const categoryOptions = [
    { id: 'Laptop', label: 'Laptop' },
    { id: 'Desktop', label: 'Desktop' },
    { id: 'Monitor', label: 'Monitor' },
    { id: 'Printer', label: 'Printer' },
    { id: 'Mobile Device', label: 'Mobile Device' },
    { id: 'Tablet', label: 'Tablet' },
    { id: 'Keyboard', label: 'Keyboard' },
    { id: 'Mouse', label: 'Mouse' },
    { id: 'Headset', label: 'Headset' },
    { id: 'Other', label: 'Other' },
  ];

  const conditionOptions = [
    { id: 'New', label: 'New' },
    { id: 'Excellent', label: 'Excellent' },
    { id: 'Good', label: 'Good' },
    { id: 'Fair', label: 'Fair' },
    { id: 'Poor', label: 'Poor' },
  ];

  // ---------- Initialize crypto keys ----------
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
        setError("Failed to initialize secure connection. Please refresh.");
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  // ---------- utilities ----------
  const extractNumber = (value: string): number => {
    const match = value.match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  };

  const toISO = (value: string): string => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  };

  const formatDateForInput = (isoString: string): string => {
    const d = new Date(isoString);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const isAssignedBool = (label: string): boolean => {
    return label.trim().toLowerCase() !== 'unassigned' && label.trim() !== '';
  };

  // ---------- form handlers ----------
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssignedToChange = (value: string) => {
    updateFormData('assignedTo', value);
    
    const selectedEmployee = employeeOptions.find(emp => emp.label === value);
    updateFormData('assignedToDn', selectedEmployee?.dn || '');
  };

  // ---------- load employees with encryption ----------
  useEffect(() => {
    if (!isOpen || !cryptoReady || !backendPublicKey || !keyPair) return;

    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setError('');

        const res = await getUsers(
          {}, // empty query
          backendPublicKey,
          keyPair
        );

        if (res) {
          const users: IUser[] = res.data || [];
          
          const opts = users.map((user: IUser) => {
            const label = user.displayName?.trim() 
              ? user.displayName 
              : user.username || 'Unknown User';
            
            return {
              id: label,
              label,
              dn: user.dn
            };
          });

          opts.push({ 
            id: 'Unassigned', 
            label: 'Unassigned',
            dn: ''
          });

          if (!cancelled) {
            setEmployeeOptions(opts);
            // If empty in create mode, prefill "Unassigned"
            if (mode === 'create' && !formData.assignedTo) {
              updateFormData('assignedTo', 'Unassigned');
              updateFormData('assignedToDn', '');
            }
          }
        } else {
          throw new Error(res.description || 'Failed to load employees');
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(err?.message || 'Failed to load employees');
          setEmployeeOptions([{ 
            id: 'Unassigned', 
            label: 'Unassigned',
            dn: ''
          }]);
        }
      } finally {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
      }
    };

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, cryptoReady, backendPublicKey, keyPair]);

  // ---------- load inventory data for edit mode with encryption ----------
  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !inventoryId || !cryptoReady || !backendPublicKey || !keyPair) return;

    let cancelled = false;

    const loadInventoryData = async () => {
      try {
        setLoadingInventory(true);
        setError('');

        const res = await getInventoryById(
          inventoryId,
          backendPublicKey,
          keyPair
        );
        
        if (!res.isSuccess) {
          throw new Error(res.description || 'Failed to load inventory data');
        }

        if (!res.data || cancelled) return;

        const inventory = res.data;

        // Convert API data to form state
        setFormData({
          itemName: inventory.name || '',
          category: inventory.category || '',
          brand: inventory.brand || '',
          serialNumber: inventory.serialNumber || '',
          operatingSystem: inventory.os || '',
          processor: inventory.processor || '',
          ram: `${inventory.ramGb}GB` || '',
          storage: `${inventory.storageGb}GB` || '',
          purchaseDate: formatDateForInput(inventory.purchaseDate) || '',
          condition: inventory.condition || '',
          assignedTo: inventory.assignedTo || 'Unassigned',
          assignedToDn: inventory.assignedToDn || '',
        });

      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(err?.message || 'Failed to load inventory data');
        }
      } finally {
        if (!cancelled) {
          setLoadingInventory(false);
        }
      }
    };

    // If initialData is provided, use it instead of fetching
    if (initialData) {
      setFormData({
        itemName: initialData.name || '',
        category: initialData.category || '',
        brand: initialData.brand || '',
        serialNumber: initialData.serialNumber || '',
        operatingSystem: initialData.os || '',
        processor: initialData.processor || '',
        ram: initialData.ramGb ? `${initialData.ramGb}GB` : '',
        storage: initialData.storageGb ? `${initialData.storageGb}GB` : '',
        purchaseDate: initialData.purchaseDate ? formatDateForInput(initialData.purchaseDate) : '',
        condition: initialData.condition || '',
        assignedTo: initialData.assignedTo || 'Unassigned',
        assignedToDn: initialData.assignedToDn || '',
      });
      setLoadingInventory(false);
    } else {
      loadInventoryData();
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, inventoryId, initialData, cryptoReady, backendPublicKey, keyPair]);

  // ---------- validation ----------
  const isFormValid = useMemo(() => {
    return (
      formData.itemName.trim() !== '' &&
      formData.category.trim() !== '' &&
      formData.brand.trim() !== '' &&
      formData.serialNumber.trim() !== '' &&
      formData.operatingSystem.trim() !== '' &&
      formData.processor.trim() !== '' &&
      formData.ram.trim() !== '' &&
      formData.storage.trim() !== '' &&
      formData.purchaseDate.trim() !== '' &&
      formData.condition.trim() !== '' &&
      formData.assignedTo.trim() !== ''
    );
  }, [formData]);

  // ---------- reset ----------
  const resetForm = () => {
    setFormData({
      itemName: '',
      category: '',
      brand: '',
      serialNumber: '',
      operatingSystem: '',
      processor: '',
      ram: '',
      storage: '',
      purchaseDate: '',
      condition: '',
      assignedTo: '',
      assignedToDn: '',
    });
    setError('');
  };

  // ---------- submit with encryption ----------
  const handleSave = async () => {
    if (!isFormValid || submitting || !cryptoReady || !backendPublicKey || !keyPair) return;

    setSubmitting(true);
    setError('');

    try {
      const assigned = isAssignedBool(formData.assignedTo);

      const payload: CreateInventoryPayload = {
        name: formData.itemName.trim(),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        serialNumber: formData.serialNumber.trim(),
        os: formData.operatingSystem.trim(),
        processor: formData.processor.trim(),
        ramGb: extractNumber(formData.ram),
        storageGb: extractNumber(formData.storage),
        condition: formData.condition.trim(),
        assignedTo: formData.assignedTo.trim(),
        assignedToDn: formData.assignedToDn.trim(),
        purchaseDate: toISO(formData.purchaseDate),
        assignedDate: assigned ? new Date().toISOString() : undefined,
        isAssigned: assigned,
      };

      console.log(`${mode === 'create' ? 'Creating' : 'Updating'} inventory with payload:`, payload);

      let res;
      
      if (mode === 'create') {
        res = await createInventory(payload, backendPublicKey, keyPair);
      } else {
        if (!inventoryId) throw new Error('Inventory ID is required for update');
        res = await updateInventory(inventoryId, payload, backendPublicKey, keyPair);
      }

      console.log(`${mode === 'create' ? 'Create' : 'Update'} inventory response:`, res);

      if (!res.isSuccess) {
        const msg =
          res.description ||
          (res.errors || [])
            .map((e: any) => e?.description || e?.field)
            .join(', ') ||
          `Failed to ${mode} inventory`;

        throw new Error(msg);
      }

      resetForm();
      onClose();
      
      // Call the appropriate callback
      if (mode === 'create' && onResourceCreated) {
        onResourceCreated();
      } else if (mode === 'edit' && onResourceUpdated) {
        onResourceUpdated();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || `Failed to ${mode} inventory`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Show crypto loading state
  if (!cryptoReady && isOpen) {
    return (
      <SlideModal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Add New Resource' : 'Edit Resource'}>
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin" size={32} />
          <span className="ml-2">Initializing secure connection...</span>
        </div>
      </SlideModal>
    );
  }

  // Don't render if in edit mode and still loading
  if (mode === 'edit' && loadingInventory) {
    return (
      <SlideModal isOpen={isOpen} onClose={onClose} title="Edit Resource">
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin" size={32} />
          <span className="ml-2">Loading inventory data...</span>
        </div>
      </SlideModal>
    );
  }

  return (
    <SlideModal 
      isOpen={isOpen} 
      onClose={onClose} 
      backdropzindex='z-300'
      containerzindex='z-400'
      title={mode === 'create' ? 'Add New Resource' : 'Edit Resource'}
    >
      <div>
        {/* Crypto Status Indicator */}
        {!cryptoReady && (
          <div className="mb-4 rounded-md border border-[#FEF0C7] bg-[#FFFAEB] p-3 text-sm text-[#B54708]">
            Initializing secure connection...
          </div>
        )}

        <div className="min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4">
          <div className="border-b border-[#D0D5DD] mb-4">
            <p className="text-[#182230] font-medium text-[20px]">
              Resource Information
            </p>
          </div>

          {/* row 1 */}
          <div className="flex lg:flex-row flex-col gap-4 mt-4">
            <Input
              value={formData.itemName}
              onChange={(e) => updateFormData('itemName', e.target.value)}
              label="Item Name"
              placeholder="Enter your resource name"
              disabled={submitting}
            />
            <Dropdown
              label="Category"
              value={formData.category}
              onChange={(value) => updateFormData('category', value)}
              placeholder="Select Category"
              options={categoryOptions}
              required
              name="category"
              disabled={submitting}
            />
          </div>

          {/* row 2 */}
          <div className="flex lg:flex-row flex-col gap-4 mt-4">
            <Input
              value={formData.brand}
              onChange={(e) => updateFormData('brand', e.target.value)}
              label="Brand"
              placeholder="Enter brand name"
              disabled={submitting}
            />
            <Input
              value={formData.serialNumber}
              onChange={(e) => updateFormData('serialNumber', e.target.value)}
              label="Serial Number / IMEI"
              placeholder="Enter serial number / IMEI"
              disabled={submitting}
            />
          </div>

          {/* row 3 */}
          <div className="flex lg:flex-row flex-col gap-4 mt-4">
            <Input
              value={formData.operatingSystem}
              onChange={(e) => updateFormData('operatingSystem', e.target.value)}
              label="Operating System"
              placeholder="Enter Operating System"
              disabled={submitting}
            />
            <Input
              value={formData.processor}
              onChange={(e) => updateFormData('processor', e.target.value)}
              label="Processor"
              placeholder="Enter Processor"
              disabled={submitting}
            />
          </div>

          {/* row 4 */}
          <div className="flex lg:flex-row flex-col gap-4 mt-4">
            <Input
              value={formData.ram}
              onChange={(e) => updateFormData('ram', e.target.value)}
              label="RAM"
              placeholder="Enter RAM (e.g., 16GB)"
              disabled={submitting}
            />
            <Input
              value={formData.storage}
              onChange={(e) => updateFormData('storage', e.target.value)}
              label="Storage"
              placeholder="Enter Storage (e.g., 512GB SSD)"
              disabled={submitting}
            />
          </div>

          {/* row 5 */}
          <div className="flex lg:flex-row flex-col gap-4 mt-4">
            <DatePicker
              label="Purchase Date"
              value={formData.purchaseDate}
              onChange={(value) => updateFormData('purchaseDate', value)}
              placeholder="Select purchase date"
              required
              name="purchase-date"
              disabled={submitting}
            />
            <Dropdown
              label="Condition"
              value={formData.condition}
              onChange={(value) => updateFormData('condition', value)}
              placeholder="Select Condition"
              options={conditionOptions}
              required
              name="condition"
              disabled={submitting}
            />
          </div>

          {/* row 6 */}
          <div className="w-full mt-4">
            <Dropdown
              label="Assigned To"
              value={formData.assignedTo}
              onChange={handleAssignedToChange}
              placeholder={
                loadingEmployees ? 'Loading employees...' : 'Select employee'
              }
              searchable
              options={employeeOptions}
              required
              name="assigned-to"
              disabled={loadingEmployees || submitting}
            />
          </div>

          {error && (
            <p className="text-[#F04438] text-sm mt-3">{error}</p>
          )}
        </div>

        <div className="flex justify-end items-center gap-4 mt-6">
          <p
            onClick={handleCancel}
            className="text-[#F04438] text-base cursor-pointer font-medium"
          >
            Cancel
          </p>
          <Button
            variant="primary"
            disabled={!isFormValid || submitting || !cryptoReady}
            onClick={handleSave}
            icon={submitting ? <Loader className="animate-spin" size={16} /> : <Check color="#002244" />}
          >
            {submitting 
              ? (mode === 'create' ? 'Creating…' : 'Updating…') 
              : (mode === 'create' ? 'Create Resource' : 'Update Resource')
            }
          </Button>
        </div>
      </div>
    </SlideModal>
  );
}