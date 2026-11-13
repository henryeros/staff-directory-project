'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'react-feather';
import { useEffect, useMemo, useState } from 'react';

import EmployeeSummery from '@/assets/icons/dashboards/employee-summary.svg';
import EmployeeCircle from '@/assets/icons/dashboards/employee-circle.svg';
import DepartmentCircle from '@/assets/icons/dashboards/department-circle.svg';
import HireCircle from '@/assets/icons/dashboards/hire-circle.svg';
import Departmentsummery from '@/assets/icons/dashboards/department-summary.svg';
import Hiresummery from '@/assets/icons/dashboards/hire-summary.svg';

import Button from '@/components/shared/button';
import AddNewEmployeeModal from '@/modals/addNewEmployeeModal';
import HireTable from '@/components/tables/hireTable';
import DashboardSummeryCard from './dashboardSummeryCard';
import Loader from '@/components/shared/loader';
import { getHires, getAnalytics } from "@/lib/services/dashboard";
import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";

import type { HireApiResult, HireQuery, HireRow } from '@/types/secure';
import type { AnalyticsApiResult } from '@/types/analytics';

// ========== Animations ==========
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1, 
      delayChildren: 0.2 
    } 
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    } 
  },
};

const tableVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      delay: 0.4, 
      ease: "easeOut" // Simplified ease function
    } 
  },
};

// ========== Table row shape ==========
type TableHireData = {
  sn: number;
  fullName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  status: 'Active' | 'Inactive';
  action: unknown;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  employmentType?: string;
  gender?: string;
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // ---- Encryption keys state ----
  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [cryptoReady, setCryptoReady] = useState<boolean>(false);

  // ---- Hires table state ----
  const [rows, setRows] = useState<TableHireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // ---- Analytics state for summary cards ----
  const [analytics, setAnalytics] = useState<{
    totalEmployees: number;
    totalDepartments: number;
    totalNewHires: number;
  } | null>(null);

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  // Initialize crypto keys
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
        setErr("Failed to initialize secure connection. Please refresh.");
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  // Map API -> table rows
  function mapToTableData(apiRows: any): any {
    return apiRows.map((r: any, idx) => ({
      sn: idx + 1,
      fullName: r.displayName,
      jobTitle: r.jobTitle,
      department: r.department || 'N/A',
      startDate: r.startDate,
      status: r.isActive === 'true' ? 'Active' : 'Inactive',
      action: null,
      email: r.email,
      phoneNumber: r.phoneNumber,
      dateOfBirth: r.dateOfBirth,
      employmentType: r.EmploymentTypeString,
      gender: r.gender,
      dn: r.dn,
    }));
  }

  // Build cards from analytics
  const dashboardData = useMemo(
    () => [
      {
        id: 1,
        title: 'Total Employees',
        value: analytics?.totalEmployees ?? 0,
        icon: EmployeeSummery,
        bgIcon: EmployeeCircle,
      },
      {
        id: 2,
        title: 'Total Departments',
        value: analytics?.totalDepartments ?? 0,
        icon: Departmentsummery,
        bgIcon: DepartmentCircle,
      },
      {
        id: 3,
        title: 'New Hires',
        value: analytics?.totalNewHires ?? 0,
        icon: Hiresummery,
        bgIcon: HireCircle,
      },
    ],
    [analytics]
  );

  // Fetch dashboard data with encryption
  useEffect(() => {
    if (!cryptoReady || !backendPublicKey || !keyPair) return;

    const ctrl = new AbortController();
    
    (async () => {
      try {
        setLoading(true);

        // Fetch analytics
        console.log("Fetching analytics...");
        const analyticsResult = await getAnalytics(
          backendPublicKey,
          keyPair,
          // { signal: ctrl.signal }
        );
        console.log("Analytics result:", analyticsResult);
        setAnalytics(analyticsResult.data);

        // Fetch hires with query params
        const hireQuery: HireQuery = {
          Branch: "",
          PageNumber: 1,
          PageSize: 10,
          Search: ""
        };

        console.log("Fetching hires with query:", hireQuery);
        const hiresResult = await getHires(
          hireQuery,
          backendPublicKey,
          keyPair,
          { signal: ctrl.signal }
        );
        console.log("Hires result:", hiresResult);
        
        setRows(mapToTableData(hiresResult.data));
        setErr(null);
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        console.error("Dashboard error:", e);
        setErr(e?.message ?? "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [cryptoReady, backendPublicKey, keyPair]);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <AddNewEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Summary Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants}>
        {dashboardData.map((data, index) => (
          <DashboardSummeryCard key={data.id} data={data} index={index} />
        ))}
      </motion.div>

      <motion.div variants={{
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    } 
  },
}} className="flex justify-between items-center my-5">
        <p className="text-[#182230] text-[20px] font-medium">New Hires</p>
        <div className="flex gap-3 items-center w-1/2 justify-end">
          <Link href="/employees" className="text-[#002244] text-[16px] font-medium">
            View all employees
          </Link>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="w-[25%]"
            icon={<Plus size={16} color="#002244" />}
          >
            Add New
          </Button>
        </div>
      </motion.div>

      <motion.div variants={
        {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      delay: 0.4, 
      ease: "easeOut"
    } 
  },
}
      }>
        {loading ? (
          <Loader />
        ) : (
          <HireTable data={rows} />
        )}
      </motion.div>
    </motion.div>
  );
}