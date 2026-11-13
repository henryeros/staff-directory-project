'use client';

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DashboardSummeryCard from "../dashboard/dashboardSummeryCard";
import EmployeeSummery from '@/assets/icons/dashboards/resource-summary.svg';
import EmployeeCircle from '@/assets/icons/dashboards/employee-circle.svg';
import DepartmentCircle from '@/assets/icons/dashboards/department-circle.svg';
import HireCircle from '@/assets/icons/dashboards/hire-circle.svg';
import Departmentsummery from '@/assets/icons/dashboards/department-summary.svg';
import Hiresummery from '@/assets/icons/dashboards/hire-summary.svg';

import Button from "@/components/shared/button";
import ResourcesTable from "@/components/tables/resourcesTable";
import Input from "@/components/shared/input";
import { Search, Plus } from "react-feather";
import AddNewResourceModal from "@/modals/addNewResourcesModal";
import { 
  getInventoriesActivities,  
  getInventories,
  type InventoryRow,
  type PaginatedQuery 
} from "@/lib/services/dashboard";
import { useGetPublicKeyQuery } from "@/lib/store/api/card/api";
import { generateRSAKeyPair, importPublicKey } from "@/lib/crypto";

interface UIResourceRow {
  id: number;
  name: string;
  category: string;
  brand: string;
  serialNo: string;
  assignedTo: string;
  ram: string;
  operatingSystem: string;
  processor: string;
  storage: string;
  status: 'Available' | 'Assigned';
  purchase?: string;
  condition?: string;
}

interface InventoryAnalyticsData {
  totalResources: number;
  assignedResources: number;
  unassignedResources: number;
}

function safe(val: any, fallback = "N/A") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" && val.trim() === "") return fallback;
  return String(val);
}

function mapInventoryToUI(row: InventoryRow): UIResourceRow {
  return {
    id: row.id,
    name: safe(row.name),
    category: safe(row.category),
    brand: safe(row.brand),
    serialNo: safe(row.serialNumber),
    assignedTo: safe(row.assignedTo),
    ram: `${safe(row.ram)} GB`,
    operatingSystem: safe(row.os),
    processor: safe(row.processor),
    storage: `${safe(row.storage)} GB`,
    status: row.isAssigned ? "Assigned" : "Available",
    condition: safe(row.condition),
  };
}

export default function Resources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backendPublicKey, setBackendPublicKey] = useState<CryptoKey | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [cryptoReady, setCryptoReady] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'' | 'name' | 'category' | 'brand' | 'purchase'>('');
  const [inventories, setInventories] = useState<UIResourceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [analytics, setAnalytics] = useState<InventoryAnalyticsData>({
    totalResources: 0,
    assignedResources: 0,
    unassignedResources: 0,
  });

  const { data: publicKeyRes } = useGetPublicKeyQuery({});

  const categories = ['Laptop', 'Mouse', 'Monitor', 'Keyboard', 'Tablet', 'Printer'];

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
        setError("Failed to initialize secure connection. Please refresh.");
      }
    };

    void initializeCrypto();
  }, [publicKeyRes]);

  async function fetchInventories() {
    if (!cryptoReady || !backendPublicKey || !keyPair) return;

    try {
      setLoading(true);
      setError("");

      const query: PaginatedQuery = {
        PageNumber: 1,
        PageSize: 200,
        Search: searchQuery.trim() || undefined,
      };

      const res = await getInventories(query, backendPublicKey, keyPair);

      if (res) {
        const mapped = (res.data || []).map(mapInventoryToUI);
        setInventories(mapped);
        const assignedCount = mapped.filter(r => r.status === "Assigned").length;
        const totalCount = mapped.length;
        const unassignedCount = totalCount - assignedCount;

        setAnalytics({
          totalResources: totalCount,
          assignedResources: assignedCount,
          unassignedResources: unassignedCount,
        });
      } else {
        setError(res.description || "Failed to fetch inventories");
        setInventories([]);
      }

    } catch (e: any) {
      setError(e?.message || "Failed to fetch inventories");
      setInventories([]);
      setAnalytics({
        totalResources: 0,
        assignedResources: 0,
        unassignedResources: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnalytics() {
    if (!cryptoReady || !backendPublicKey || !keyPair) return;

    try {
      const query: PaginatedQuery = {
        PageNumber: 1,
        PageSize: 10,
      };

      const res = await getInventoriesActivities(query, backendPublicKey, keyPair);

      if (res.isSuccess) {
        setAnalytics({
          totalResources: res.data.totalResources,
          assignedResources: res.data.assignedResources,
          unassignedResources: res.data.unassignedResources,
        });
      }
    } catch (e: any) {
    }
  }

  const handleResourceCreated = () => {
    fetchInventories();
    fetchAnalytics();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (cryptoReady && backendPublicKey && keyPair) {
      fetchInventories();
      fetchAnalytics();
    }
  }, [cryptoReady, backendPublicKey, keyPair]);

  useEffect(() => {
    if (!cryptoReady || !backendPublicKey || !keyPair) return;

    const t = setTimeout(() => {
      fetchInventories();
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, cryptoReady, backendPublicKey, keyPair]);

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSort = (field: string) => {
    setSortBy(field as typeof sortBy);
  };

  const filteredAndSortedData = useMemo(() => {
    const data = inventories.filter(resource => {
      if (statusFilter === 'active' && resource.status !== 'Available') return false;
      if (statusFilter === 'inactive' && resource.status !== 'Assigned') return false;

      if (categoryFilter.length > 0 && !categoryFilter.includes(resource.category)) {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          resource.name,
          resource.brand,
          resource.category,
          resource.serialNo,
          resource.assignedTo,
          resource.processor,
          resource.operatingSystem,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...data].sort((a, b) => {
      if (!sortBy) return 0;

      if (sortBy === "purchase") {
        const aDate = a.purchase ? new Date(a.purchase).getTime() : 0;
        const bDate = b.purchase ? new Date(b.purchase).getTime() : 0;
        return aDate - bDate;
      }

      const aVal = (a as any)[sortBy] ?? "";
      const bVal = (b as any)[sortBy] ?? "";

      return String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
    });

    return sorted;
  }, [inventories, statusFilter, categoryFilter, sortBy, searchQuery]);

  const dashboardData = useMemo(() => ([
    {
      id: 1,
      title: 'Total Resources',
      value: analytics.totalResources,
      icon: EmployeeSummery,
      bgIcon: EmployeeCircle
    },
    {
      id: 2,
      title: 'Assigned to Employees',
      value: analytics.assignedResources,
      icon: Departmentsummery,
      bgIcon: DepartmentCircle
    },
    {
      id: 3,
      title: 'Available',
      value: analytics.unassignedResources,
      icon: Hiresummery,
      bgIcon: HireCircle
    },
  ]), [analytics]);

  if (!cryptoReady && !error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-[#475467]">Initializing secure connection...</div>
      </div>
    );
  }

  return (
    <div className="">
      <AddNewResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResourceCreated={handleResourceCreated}
        // backendPublicKey={backendPublicKey}
        // keyPair={keyPair}
        // cryptoReady={cryptoReady}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.p
          className="text-[#182230] font-semibold text-[24px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Resource Inventory
        </motion.p>
        <motion.p
          className="text-[#475467] font-normal text-[18px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Browse and manage resources
        </motion.p>

        {!cryptoReady && (
          <div className="mb-4 rounded-md border border-[#FEF0C7] bg-[#FFFAEB] p-3 text-sm text-[#B54708]">
            Initializing secure connection...
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {dashboardData.map((data, index) => (
            <DashboardSummeryCard key={data.id} data={data} index={index} />
          ))}
        </motion.div>

        <motion.div
          className="bg-[#F3F5F9] h-[50px] lg:w-[25%] w-full rounded-[6px] flex items-center justify-between my-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
        >
          <motion.p
            onClick={() => setStatusFilter('all')}
            className={`${statusFilter === 'all' && 'bg-[#FFFFFF] text-[#182230] font-medium border border-[#D0D5DD] rounded-[6px]'} px-6 py-3 text-[#344054] text-base font-normal cursor-pointer`}
            animate={statusFilter === 'all' ? { scale: 1.02 } : { scale: 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            All
          </motion.p>
          <motion.p
            onClick={() => setStatusFilter('active')}
            className={`${statusFilter === 'active' && 'bg-[#FFFFFF] text-[#182230] font-medium border border-[#D0D5DD] rounded-[6px]'} px-6 py-3 text-[#344054] text-base font-normal cursor-pointer`}
            animate={statusFilter === 'active' ? { scale: 1.02 } : { scale: 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Available
          </motion.p>
          <motion.p
            onClick={() => setStatusFilter('inactive')}
            className={`${statusFilter === 'inactive' && 'bg-[#FFFFFF] text-[#182230] font-medium border border-[#D0D5DD] rounded-[6px]'} px-6 py-3 text-[#344054] text-base font-normal cursor-pointer`}
            animate={statusFilter === 'inactive' ? { scale: 1.02 } : { scale: 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Assigned
          </motion.p>
        </motion.div>

        <motion.div
          className="flex lg:flex-row flex-col justify-between items-center mt-5 mb-8 w-full border-y border-[#EAECF0] py-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex lg:flex-row flex-col items-center gap-3 lg:w-[70%] w-full">
            <motion.div
              className="lg:w-[50%] w-full"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                icon={<Search color='#344054' />}
                placeholder="Search resources..."
                className=""
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!cryptoReady || loading}
              />
            </motion.div>

            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <select
                onChange={(e) => handleSort(e.target.value)}
                className="appearance-none bg-white border border-[#D0D5DD] rounded-[6px] px-4 py-2 pr-8 text-[#344054] cursor-pointer"
                disabled={!cryptoReady || loading}
              >
                <option value="">Sort by...</option>
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="brand">Brand</option>
                <option value="purchase">Purchase Date</option>
              </select>
            </motion.div>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="secondary"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  disabled={!cryptoReady || loading}
                >
                  Filter
                </Button>
              </motion.div>

              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    className="absolute top-full mt-2 left-0 bg-white border border-[#D0D5DD] rounded-[6px] shadow-lg p-4 z-10 min-w-[200px]"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="font-medium text-[#182230] mb-2">Category</p>
                    {categories.map((cat, index) => (
                      <motion.label
                        key={cat}
                        className="flex items-center gap-2 mb-2 cursor-pointer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                      >
                        <input
                          type="checkbox"
                          checked={categoryFilter.includes(cat)}
                          onChange={() => toggleCategoryFilter(cat)}
                          className="cursor-pointer"
                          disabled={!cryptoReady || loading}
                        />
                        <span className="text-[#344054]">{cat}</span>
                      </motion.label>
                    ))}

                    {categoryFilter.length > 0 && (
                      <motion.button
                        onClick={() => setCategoryFilter([])}
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
              </AnimatePresence>
            </div>

            <motion.p
              className="text-[#475467] text-base font-normal"
              key={`${filteredAndSortedData.length}-${loading}-${error}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {!cryptoReady
                ? "Initializing..."
                : loading
                ? "Loading…"
                : error
                ? `Error: ${error}`
                : `${filteredAndSortedData.length} results`}
            </motion.p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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

        <ResourcesTable
          searchQuery={searchQuery}
          data={filteredAndSortedData}
          onRefresh={fetchInventories}
          loading={loading}
          error={error}
        />
      </motion.div>
    </div>
  );
}