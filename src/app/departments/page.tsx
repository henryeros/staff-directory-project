'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search } from 'react-feather';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/shared/button';
import Input from '@/components/shared/input';
import DepartmentTable from '@/components/tables/departmentTable';
import AddNewDepartmentModal from '@/modals/addNewDepartmentModal';
import Loader from '@/components/shared/loader';

import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";

import sortIcon from '@/assets/icons/dashboards/sort-icon.svg';
import filterIcon from '@/assets/icons/dashboards/filter-icon.svg';
import { getDepartments } from '@/lib/services/dashboard';

import type { PaginatedQuery, DepartmentRow as ApiDepartmentRow } from '@/lib/services/dashboard';

type TableDepartmentData = {
  id: number;
  name: string;
  head: string;
  employeesCount: number;
  dn: string;
};

type SortKey = 'name' | 'head' | 'employeesCount';

export default function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize] = useState<number>(10);
  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [cryptoReady, setCryptoReady] = useState<boolean>(false);
  const [rows, setRows] = useState<TableDepartmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [totalCounts, setTotalCounts] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

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
        setErr("Failed to initialize secure connection. Please refresh.");
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  function mapToTableData(apiRows: ApiDepartmentRow[]): TableDepartmentData[] {
    return apiRows.map((row) => ({
      id: row.id,
      name: row.name,
      head: row.headOfDepartment,
      employeesCount: row.numberOfEmployees,
      dn: row.dn,
    }));
  }

  const fetchDepartments = async () => {
    if (!cryptoReady || !backendPublicKey || !keyPair) return;

    const ctrl = new AbortController();
    
    try {
      setLoading(true);
      const departmentQuery: PaginatedQuery = {
        Branch: "",
        PageNumber: currentPage,
        PageSize: pageSize,
        Search: searchQuery
      };

      const departmentsResult = await getDepartments(
        departmentQuery,
        backendPublicKey,
        keyPair,
        { signal: ctrl.signal }
      );
      
      if (departmentsResult) {
        setRows(mapToTableData(departmentsResult.data));
        setTotalCounts(departmentsResult.totalCount);
        setErr(null);
      } else {
        setErr(departmentsResult.description || "Failed to load departments");
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setErr(e?.message ?? "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cryptoReady && backendPublicKey && keyPair) {
      fetchDepartments();
    }
  }, [cryptoReady, backendPublicKey, keyPair, currentPage, searchQuery, refreshTrigger]);

  const handleDepartmentAdded = () => {
    setCurrentPage(1);
    setRefreshTrigger(prev => prev + 1);
    setIsModalOpen(false);
  };

  const handleDepartmentUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const departments = useMemo(() => {
    const setNames = new Set<string>();
    rows.forEach(r => setNames.add(r.name));
    return Array.from(setNames);
  }, [rows]);

  const filteredAndSortedData = useMemo(() => {
    let data = [...rows];

    if (departmentFilter.length > 0) {
      data = data.filter(d => departmentFilter.includes(d.name));
    }

    if (sortKey) {
      data.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];

        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }

        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
      });
    }

    return data;
  }, [rows, departmentFilter, sortKey, sortDir, statusFilter]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir('asc');
    }
  };

  const toggleDepartmentFilter = (dept: string) => {
    setDepartmentFilter(prev =>
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
    >
      <AddNewDepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        // onDepartmentAdded={handleDepartmentAdded}
        // backendPublicKey={backendPublicKey}
        // keyPair={keyPair}
        // cryptoReady={cryptoReady}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.p
          className="text-[#182230] font-semibold text-[24px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Departments
        </motion.p>

        <motion.p
          className="text-[#475467] font-normal text-[18px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Browse and manage the company departments
        </motion.p>

        <motion.div
          className="flex lg:flex-row flex-col justify-between items-center mt-5 mb-8 w-full border-y border-[#EAECF0] py-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="flex lg:flex-row flex-col items-center gap-3 lg:w-[70%] w/full">
            <motion.div
              className="lg:w-[50%] w-full"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                icon={<Search color="#344054" />}
                placeholder="Search departments..."
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchQuery(e.target.value);
                }}
                disabled={!cryptoReady || loading}
              />
            </motion.div>

            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <select
                onChange={(e) => handleSort(e.target.value as SortKey)}
                className="appearance-none bg-white border border-[#D0D5DD] rounded-[6px] px-4 py-2 pr-8 text-[#344054] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                value={sortKey}
                disabled={!cryptoReady || loading}
              >
                <option value="">Sort by...</option>
                <option value="name">Name</option>
                <option value="head">Head of Department</option>
                <option value="employeesCount">Employees</option>
              </select>
              <Image
                src={sortIcon}
                alt="Sort"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </motion.div>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="secondary"
                  icon={<Image src={filterIcon} alt="Filter" />}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  disabled={!cryptoReady || loading}
                >
                  Filter
                </Button>
              </motion.div>

              {showFilterMenu && (
                <motion.div
                  className="absolute top-full mt-2 left-0 bg-white border border-[#D0D5DD] rounded-[6px] shadow-lg p-4 z-10 min-w-[200px]"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <p className="font-medium text-[#182230] mb-2">
                    Department
                  </p>

                  {departments.map((dept, index) => (
                    <motion.label
                      key={dept}
                      className="flex items-center gap-2 mb-2 cursor-pointer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <input
                        type="checkbox"
                        checked={departmentFilter.includes(dept)}
                        onChange={() => toggleDepartmentFilter(dept)}
                        className="cursor-pointer"
                        disabled={!cryptoReady || loading}
                      />
                      <span className="text-[#344054]">{dept}</span>
                    </motion.label>
                  ))}

                  {departmentFilter.length > 0 && (
                    <motion.button
                      onClick={() => setDepartmentFilter([])}
                      className="text-sm text-[#475467] underline mt-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!cryptoReady || loading}
                    >
                      Clear filters
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            <motion.p
              className="text-[#475467] text-base font-normal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? 'Loading...' : `${totalCounts} results`}
            </motion.p>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={!cryptoReady || loading}
              >
                Refresh
              </Button>
            </motion.div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsModalOpen(true)}
              disabled={!cryptoReady || loading}
            >
              Add New
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {!cryptoReady ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <p className="text-[#B54708] mb-2">Initializing secure connection...</p>
              <p className="text-[#475467] text-sm">Please wait while we establish a secure connection.</p>
            </div>
          </div>
        ) : loading ? (
          <Loader />
        ) : err ? (
          <div className="w-full rounded-md border border-[#FEE4E2] bg-[#FEF3F2] p-6 text-sm text-[#B42318]">
            {err}
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : (
          <DepartmentTable
            data={filteredAndSortedData}
            // currentPage={currentPage}
            // pageSize={pageSize}
            // totalResults={totalCounts}
            // onPageChange={setCurrentPage}
            // onDepartmentUpdated={handleDepartmentUpdated}
          />
        )}
      </motion.div>
    </motion.div>
  );
}