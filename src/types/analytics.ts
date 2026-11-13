// src/types/analytics.ts

export type AnalyticsData = {
  totalEmployees: number;
  totalDepartments: number;
  totalNewHires: number;
};

export type AnalyticsApiResult = {
  isSuccess: true;
  code: string;         // e.g. "OK"
  description: string;  // e.g. "Analytics fetched successfully."
  data: AnalyticsData;
};