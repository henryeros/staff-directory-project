'use client';

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Search, Plus } from "react-feather";

import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import EmployeeTable from "@/components/tables/employeeTable";
import AddNewEmployeeModal from "@/modals/addNewEmployeeModal";

import sortIcon from '@/assets/icons/dashboards/sort-icon.svg';
import filterIcon from '@/assets/icons/dashboards/filter-icon.svg';

import { getUsers } from "@/lib/services/dashboard";
import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";
import Loader from "@/components/shared/loader";

interface HireData {
  sn: number;
  fullName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  status: 'Active' | 'Inactive';
  sex: 'Male' | 'Female';
  email: string;
  phone: string;
  dateOfBirth: string;
  branch: string;
  employmentType: string;
  salary?: string;
  address?: string;
  emergencyContact?: string;
}

interface ApiUser {
  displayName?: string;
  username?: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  isActive?: boolean;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  branch?: string;
  employmentType?: string;
  dn?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<HireData[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof HireData | null, direction: 'asc' | 'desc'}>({
    key: null,
    direction: 'asc'
  });
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [cryptoReady, setCryptoReady] = useState<boolean>(false);

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  useEffect(() => {
    if (!publicKeyRes?.publicKey) return;

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
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  const fetchEmployees = async (): Promise<void> => {
    if (!cryptoReady || !backendPublicKey || !keyPair) return;

    const ctrl = new AbortController();
    
    try {
      setLoadingEmployees(true);
      setLoadError("");

      const employeeQuery = {
        Branch: "Lagos",
        PageNumber: 1,
        PageSize: 10,
        Search: ""
      };

      const res = await getUsers(employeeQuery, backendPublicKey, keyPair, { signal: ctrl.signal });

      console.log(res)

      if (!res) {
        setLoadError("Failed to load employees");
        setEmployees([]);
        return;
      }

      const mapped: HireData[] = (res.data || []).map((user: ApiUser, idx: number) => {
        const status: 'Active' | 'Inactive' = user?.isActive == false ? 'Inactive' : 'Active';
        const genderRaw = (user?.gender || "").toString().toLowerCase();
        const sex: 'Male' | 'Female' = genderRaw === 'female' ? 'Female' : 'Male';
        const branchVal = user?.branch || user?.department || "N/A";
        const empTypeVal = user?.employmentType || "N/A";

        const safe = (val: any, fallback: string = "N/A"): string => {
          if (val === null || val === undefined) return fallback;
          if (typeof val === "string" && val.trim() === "") return fallback;
          return val;
        };

        return {
          sn: idx + 1,
          fullName: safe(user?.displayName || user?.username),
          jobTitle: safe(user?.jobTitle),
          department: safe(user?.department),
          startDate: safe(user?.startDate),
          status,
          sex,
          email: safe(user?.email),
          phone: safe(user?.phoneNumber),
          dateOfBirth: safe(user?.dateOfBirth),
          branch: safe(branchVal),
          employmentType: safe(empTypeVal),
          salary: "N/A",
          address: "N/A",
          emergencyContact: "N/A",
          dn: safe(user?.dn),
          isActive: user.isActive
        };
      });

      setEmployees(mapped);
    } catch (err: any) {
      console.error(err);
      setLoadError(err?.message || "Could not fetch employees");
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (cryptoReady) {
      fetchEmployees();
    }
  }, [cryptoReady]);

  const handleEmployeeAdded = (): void => {
    setIsModalOpen(false);
    fetchEmployees();
  };

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.department))).filter(Boolean);
  }, [employees]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...employees];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp =>
        emp.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (departmentFilter.length > 0) {
      filtered = filtered.filter(emp =>
        departmentFilter.includes(emp.department)
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.fullName.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.branch.toLowerCase().includes(q)
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [employees, statusFilter, departmentFilter, searchQuery, sortConfig]);

  const handleSort = (key: keyof HireData): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleDepartmentFilter = (dept: string): void => {
    setDepartmentFilter(prev =>
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  return (
    <div>
      <AddNewEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />

      <div>
        <p className="text-[#182230] font-semibold text-[24px]">
          Employee Directory
        </p>
        <p className="text-[#475467] font-normal text-[18px]">
          Browse and manage employee information
        </p>

        <div className="bg-[#F3F5F9] h-[50px] lg:w-[25%] w-full rounded-[6px] flex items-center justify-between my-6">
          <p
            onClick={() => setStatusFilter('all')}
            className={`${
              statusFilter === 'all' &&
              'bg-[#FFFFFF] text-[#182230] font-medium border border-[#D0D5DD] rounded-[6px]'
            } px-6 py-3 text-[#344054] text-base font-normal cursor-pointer`}
          >
            All
          </p>
          <p
            onClick={() => setStatusFilter('active')}
            className={`${
              statusFilter === 'active' &&
              'bg-[#FFFFFF] text-[#182230] font-medium border border-[#D0D5DD] rounded-[6px]'
            } px-6 py-3 text-[#344054] text-base font-normal cursor-pointer`}
          >
            Active
          </p>
          <p
            onClick={() => setStatusFilter('inactive')}
            className={`${
              statusFilter === 'inactive' &&
              'bg-[#FFFFFF] text-[#182230] font-medium border border-[#D0D5DD] rounded-[6px]'
            } px-6 py-3 text-[#344054] text-base font-normal cursor-pointer`}
          >
            Inactive
          </p>
        </div>

        <div className="flex lg:flex-row flex-col justify-between items-center mt-5 mb-8 w-full border-y border-[#EAECF0] py-3">
          <div className="flex lg:flex-row flex-col items-center gap-3 lg:w-[70%] w-full">
            <div className="lg:w-[50%] w-full">
              <Input
                icon={<Search color="#344054" />}
                placeholder="Search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <Image
                src={sortIcon}
                alt=""
                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
              <select
                onChange={(e) => handleSort(e.target.value as keyof HireData)}
                className="appearance-none bg-white border border-[#D0D5DD] rounded-[6px] px-4 py-2 pr-8 text-[#344054] cursor-pointer"
              >
                <option value="">Sort</option>
                <option value="fullName">Name</option>
                <option value="department">Department</option>
                <option value="startDate">Start Date</option>
                <option value="jobTitle">Job Title</option>
              </select>
            </div>

            <div className="relative">
              <Button
                variant="secondary"
                icon={<Image src={filterIcon} alt="" />}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                Filter
              </Button>

              {showFilterMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-[#D0D5DD] rounded-[6px] shadow-lg p-4 z-10 min-w-[200px]">
                  <p className="font-medium text-[#182230] mb-2">
                    Department
                  </p>
                  {departments.map((dept) => (
                    <label
                      key={dept}
                      className="flex items-center gap-2 mb-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={departmentFilter.includes(dept)}
                        onChange={() => toggleDepartmentFilter(dept)}
                        className="cursor-pointer"
                      />
                      <span className="text-[#344054]">{dept}</span>
                    </label>
                  ))}

                  {departmentFilter.length > 0 && (
                    <button
                      onClick={() => setDepartmentFilter([])}
                      className="text-sm text-[#475467] underline mt-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-[#475467] text-base font-normal">
              {loadingEmployees
                ? <Loader />
                : loadError
                ? "Error loading"
                : `${filteredAndSortedData.length} results`}
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            Add New
          </Button>
        </div>
      </div>

      <div>
        {loadError ? (
          <div className="py-10 text-center text-[#F04438]">
            {loadError}
          </div>
        ) : loadingEmployees && employees.length === 0 ? (
          <div className="py-10 text-center text-[#475467]">Loading…</div>
        ) : (
          <EmployeeTable data={filteredAndSortedData} />
        )}
      </div>
    </div>
  );
}