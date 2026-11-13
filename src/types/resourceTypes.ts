export interface ResourceData {
  id: number;
  name: string;
  category: string;
  brand: string;
  serialNo: string;
  operatingSystem: string;
  processor: string;
  ram: string;
  storage: string;
  purchase: string;
  condition: string;
  assignedTo: string;
  status: 'Available' | 'Assigned';
}

export interface ResourceTableProps {
  data: ResourceData[];
  searchQuery: string;
}

export interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceData: ResourceData | null;
}
