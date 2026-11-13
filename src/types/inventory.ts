// src/types/inventory.ts

// -------- GET shapes --------
export type InventoryQuery = {
  PageNumber?: number; // int32
  PageSize?: number;   // int32
  Search?: string;     // string
};

// Public inventory row returned by GET (as you specified)
export type InventoryRow = {
  ID: number;          // number
  Category: number;    // number
  Brand: string;       // string
  SerialNumber: string;// string
  OS: string;          // string
  Processor: string;   // string
  RAM: number;         // number (GB)
  Storage: number;     // number (GB)
};

// GET response envelope
export type InventoryGetResult = {
  success: true;
  code: string;        // e.g. "OK"
  description: string; // e.g. "Inventories fetched successfully."
  data: InventoryRow[]; 
  total: number;
  pageNumber: number;
  pageSize: number;
};

// -------- POST shapes --------
// Incoming POST body (your fields)
export type InventoryCreateBody = {
  category: number;
  brand: string;
  serialNumber: string;
  os: string;
  processor: string;
  ramGB: number;           // number
  storageGB: number;       // number
  condition: number;       // number
  assignedTo: string;      // string
  assignedToDN: string;    // string
  purchaseDate: string;    // ISO date
  assignedDate?: string;   // ISO date (optional)
  isAssigned: boolean;     // boolean
};

// POST response (we’ll return the created public row + a message)
export type InventoryPostResult = {
  success: true;
  code: string;        // e.g. "CREATED"
  description: string; // e.g. "Inventory created."
  data: InventoryRow;  // the created/normalized row
};