'use client'

import SlideModal from '@/components/slideModal';
import Input from '@/components/shared/input';
import Dropdown from '@/components/shared/dropdown';
import React, { useMemo, useState, useEffect } from 'react';
import Button from '@/components/shared/button';
import { Check, User, Loader } from 'react-feather';
import EmployeeDeleteIcon from '@/assets/icons/dashboards/employee-delete-icon.svg';
import Image from 'next/image';

import {
  createDepartment,
  updateDepartment,
  getBranches,
  getUsers,
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
} from '@/lib/services/dashboard'; // Updated import path



import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";

/** Props **/
interface DepartmentForEdit {
  id: number;
  name: string;
  headOfDepartment: string;
  branchDn: string;
}

interface AddNewDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDepartment?: any; // if present, we are editing
  onSaved?: () => void; // ask parent to refresh department list
}

// ⬅ CHANGED: helper to generate display label from DN
function dnToLabel(dn: string): string {
  if (!dn) return "";
  const firstPart = dn.split(",")[0]; // e.g. "OU=Ibadan"
  const label = firstPart.replace(/^OU=/i, ""); // "Ibadan"
  return label || dn;
}

export default function AddNewDepartmentModal({
  isOpen,
  onClose,
  initialDepartment,
  onSaved,
}: AddNewDepartmentModalProps) {
  // ---------- encryption state ----------
  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [cryptoReady, setCryptoReady] = useState<boolean>(false);

  // form fields
  const [departmentName, setDepartmentName] = useState<string>('');
  const [departmentHead, setDepartmentHead] = useState<string>(''); // displayName of chosen head
  const [branchDn, setBranchDn] = useState<string>(''); // full DN to send to backend
  const [branchName, setBranchName] = useState<string>(''); // human-readable branch name just for UI
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]); // array of displayNames

  // fetched data
  const [userOptions, setUserOptions] = useState<{ id: string; label: string }[]>([]);
  const [branchOptions, setBranchOptions] = useState<{ id: string; label: string; dn: string }[]>([]);

  // ui state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

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
        setErrorMsg("Failed to initialize secure connection. Please refresh.");
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  // 1. Load users + branches when modal opens with encryption
  useEffect(() => {
    if (!isOpen || !cryptoReady || !backendPublicKey || !keyPair) return;

    let cancelled = false;
    async function loadMeta() {
      try {
        setLoadingMeta(true);
        setErrorMsg('');

        // load users with encryption
        const usersRes = await getUsers(
          {}, // empty query
          backendPublicKey,
          keyPair
        );

        console.log("Users response:", usersRes);
        
        let builtUserOptions: { id: string; label: string }[] = [];
        if (usersRes && Array.isArray(usersRes.data)) {
          builtUserOptions = usersRes.data.map((u, idx) => ({
            id: u.displayName || `user-${idx}`,
            label: u.displayName || u.username || u.email || `User ${idx + 1}`,
          }));
        } else {
          throw new Error(usersRes.description || 'Failed to load users');
        }

        // load branches with encryption
        const branchesRes = await getBranches(
          {}, // empty query
          backendPublicKey,
          keyPair
        );

        console.log("Branches response:", branchesRes);
        let builtBranchOptions: { id: string; label: string; dn: string }[] = [];

        // ⬅ CHANGED: use dnToLabel() to derive clean label
        if (branchesRes && Array.isArray(branchesRes.data)) {
          builtBranchOptions = branchesRes.data.map((b, idx) => {
            const human = dnToLabel(b.dn);
            return {
              id: b.dn || `branch-${idx}`,
              label: human || `Branch ${idx + 1}`,
              dn: b.dn,
            };
          });
        } else {
          throw new Error(branchesRes.description || 'Failed to load branches');
        }

        if (!cancelled) {
          setUserOptions(builtUserOptions);
          setBranchOptions(builtBranchOptions);

          // If creating new (not editing):
          // pick default branch = first in list
          if (!initialDepartment && builtBranchOptions.length > 0) {
            setBranchDn(prev => prev || builtBranchOptions[0].dn);
            setBranchName(prev => prev || builtBranchOptions[0].label);
          }

          // If editing, try to map initialDepartment.branchDn back to a label
          if (initialDepartment && initialDepartment.branchDn) {
            const match = builtBranchOptions.find(
              b => b.dn === initialDepartment.branchDn
            );
            if (match) {
              setBranchName(match.label); // human label for UI
              setBranchDn(match.dn); // ensure branchDn is set
            } else {
              // fallback: label = parse from the DN even if it wasn't in list
              const fallbackLabel = dnToLabel(initialDepartment.branchDn);
              setBranchName(fallbackLabel);
              setBranchDn(initialDepartment.branchDn);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setErrorMsg(err?.message || 'Failed to load metadata');
        }
      } finally {
        if (!cancelled) {
          setLoadingMeta(false);
        }
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialDepartment, cryptoReady, backendPublicKey, keyPair]);

  // 2. Prefill form if editing OR reset on fresh open
  useEffect(() => {
    if (!isOpen) return;

    if (initialDepartment) {
      // editing existing
      setDepartmentName(initialDepartment.name || '');
      setDepartmentHead(initialDepartment.headOfDepartment || '');
      // branchDn and branchName are set in loadMeta() based on the branchDn
      setSelectedEmployees([]); // could hydrate later if BE supports storing members
      setErrorMsg('');
      setSubmitting(false);
    } else {
      // creating new
      setDepartmentName('');
      setDepartmentHead('');
      // branchDn default handled above if branches loaded
      setBranchName('');
      setSelectedEmployees([]);
      setErrorMsg('');
      setSubmitting(false);
    }
  }, [isOpen, initialDepartment]);

  // Department Head dropdown = single-select user
  const handleDepartmentHeadChange = (value: string | string[]) => {
    if (typeof value === 'string') {
      setDepartmentHead(value);
    }
  };

  // Employees multi-select = array of users
  const handleEmployeeChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      setSelectedEmployees(value);
    }
  };

  // Branch dropdown = single-select branch
  const handleBranchChange = (value: string | string[]) => {
    if (typeof value !== 'string') return;

    // Try to find by label OR id
    const found = branchOptions.find(
      (opt) => opt.label === value || opt.id === value
    );

    if (found) {
      setBranchDn(found.dn);        // full DN we submit
      setBranchName(found.label);   // pretty label for UI
    } else {
      // fallback: if somehow user picks something not in list
      setBranchDn(value);
      setBranchName(dnToLabel(value));
    }
  };

  const handleDeleteEmployee = (employeeName: string) => {
    setSelectedEmployees(prev => prev.filter(name => name !== employeeName));
  };

  // Build chip list from selected employees
  const filteredEmployeeDetails = useMemo(() => {
    return selectedEmployees.map((name, idx) => ({
      id: String(idx),
      name,
    }));
  }, [selectedEmployees]);

  // form validity
  const isValid = useMemo(() => {
    return (
      departmentName.trim() !== '' &&
      departmentHead.trim() !== '' &&
      branchDn.trim() !== '' &&
      cryptoReady // Also require crypto to be ready
    );
  }, [departmentName, departmentHead, branchDn, cryptoReady]);

  async function handleSave() {
    if (!isValid || !cryptoReady || !backendPublicKey || !keyPair) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      if (initialDepartment) {
        // UPDATE FLOW
        const payload: UpdateDepartmentPayload = {
          id: initialDepartment.id,
          name: departmentName.trim(),
          headOfDepartment: departmentHead.trim(),
          branchDn: branchDn.trim(), // submit DN
        };

        console.log("Updating department with payload:", payload);

        const res = await updateDepartment(
          payload,
          backendPublicKey,
          keyPair
        );

        console.log("Update department response:", res);

        if (!res) {
          if (res.errors && res.errors.length > 0) {
            const details = res.errors
              .map((e) => `${e.field}: ${e.description}`)
              .join(', ');
            throw new Error(details || res.description || 'Update failed');
          } else {
            throw new Error(res.description || 'Update failed');
          }
        }
      } else {
        // CREATE FLOW
        const payload: CreateDepartmentPayload = {
          name: departmentName.trim(),
          headOfDepartment: departmentHead.trim(),
          branchDn: branchDn.trim(), // submit DN
        };

        console.log("Creating department with payload:", payload);

        const res = await createDepartment(
          payload,
          backendPublicKey,
          keyPair
        );

        console.log("Create department response:", res);

        if (!res) {
          if (res.errors && res.errors.length > 0) {
            const details = res.errors
              .map((e) => `${e.field}: ${e.description}`)
              .join(', ');
            throw new Error(details || res.description || 'Create failed');
          } else {
            throw new Error(res.description || 'Create failed');
          }
        }
      }

      // success 🎉
      if (onSaved) onSaved(); // let parent refresh list

      // reset + close modal
      setDepartmentName('');
      setDepartmentHead('');
      setBranchDn('');
      setBranchName('');
      setSelectedEmployees([]);
      onClose();

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Something went wrong while saving');
    } finally {
      setSubmitting(false);
    }
  }

  const handleCancel = () => {
    setDepartmentName('');
    setDepartmentHead('');
    setBranchDn('');
    setBranchName('');
    setSelectedEmployees([]);
    setErrorMsg('');
    onClose();
  };

  // Show crypto loading state
  if (!cryptoReady && isOpen) {
    return (
      <SlideModal 
        isOpen={isOpen} 
        onClose={onClose}
        backdropzindex='z-500'
        containerzindex='z-600'
        title={initialDepartment ? 'Edit Department' : 'Add New Department'}
      >
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin" size={32} />
          <span className="ml-2">Initializing secure connection...</span>
        </div>
      </SlideModal>
    );
  }

  return (
    <SlideModal
      isOpen={isOpen}
      onClose={handleCancel}
      backdropzindex='z-500'
      containerzindex='z-600'
      title={initialDepartment ? 'Edit Department' : 'Add New Department'}
    >
      <div>
        {/* Crypto Status Indicator */}
        {!cryptoReady && (
          <div className="mb-4 rounded-md border border-[#FEF0C7] bg-[#FFFAEB] p-3 text-sm text-[#B54708]">
            Initializing secure connection...
          </div>
        )}

        <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4'>
          {errorMsg && (
            <div className="mb-3 text-[#F04438] text-sm">{errorMsg}</div>
          )}

          {/* Department Name */}
          <Input
            label='Department Name'
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder='Enter department name'
            disabled={submitting || loadingMeta}
          />

          {/* Department Head (Dropdown of users) */}
          <Dropdown
            label='Department Head'
            placeholder={loadingMeta ? 'Loading users...' : 'Select department head'}
            options={userOptions /* [{id,label}] */}
            onChange={handleDepartmentHeadChange}
            value={departmentHead}
            className='my-3'
            disabled={submitting || loadingMeta}
          />

          {/* Branch (Dropdown of branches) */}
          <Dropdown
            label='Branch'
            placeholder={loadingMeta ? 'Loading branches...' : 'Select branch'}
            options={branchOptions.map((b) => ({
              id: b.id,
              label: b.label,
            }))}
            onChange={handleBranchChange}
            value={branchName || branchDn /* show nice branch label if we have it */}
            className='mb-3'
            disabled={submitting || loadingMeta}
          />

          {/* Employees (multi-select of same user list) */}
          <Dropdown
            label='Employees'
            placeholder={loadingMeta ? 'Loading users...' : 'Select employees'}
            options={userOptions}
            onChange={handleEmployeeChange}
            value={selectedEmployees}
            multiSelect={true}
            disabled={submitting || loadingMeta}
          />
        </div>

        <div className='min-h-[200px] bg-[#FFFFFF] rounded-[12px] p-4 mt-4'>
          <div className="flex flex-wrap gap-3">
            {filteredEmployeeDetails.length > 0 ? (
              filteredEmployeeDetails.map((employee) => (
                <div
                  key={employee.id}
                  className="relative group inline-flex"
                >
                  <div className='text-[#182230] px-4 py-2 bg-[#F2F4F7] rounded-[38px] font-medium text-base inline-flex items-center max-w-full min-w-0'>
                    <span className="truncate">{employee.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteEmployee(employee.name)}
                    className="absolute -top-1 -right-1 transition-opacity duration-200 rounded-full p-0.5 shadow-sm border bg-white hover:bg-gray-50"
                    disabled={submitting}
                  >
                    <Image
                      src={EmployeeDeleteIcon}
                      alt='Delete employee'
                      width={16}
                      height={16}
                      className="cursor-pointer"
                    />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#667085] w-full">
                <User size={48} className="mx-auto mb-2 opacity-50" />
                <p>No employees selected</p>
                <p className="text-sm">
                  Select employees from the dropdown above to see them here
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end items-center gap-4 mt-6'>
          <button
            onClick={handleCancel}
            className='text-[#F04438] text-base cursor-pointer font-medium hover:text-[#d03529] transition-colors'
            disabled={submitting}
          >
            Cancel
          </button>
          <Button
            variant='primary'
            icon={submitting ? <Loader className="animate-spin" size={16} /> : <Check color='#002244'/>}
            disabled={!isValid || submitting || loadingMeta || !cryptoReady}
            onClick={handleSave}
            // loading={submitting}
          >
            {submitting
              ? (initialDepartment ? 'Updating…' : 'Saving…')
              : (initialDepartment ? 'Update Department' : 'Save Changes')}
          </Button>
        </div>
      </div>
    </SlideModal>
  );
}