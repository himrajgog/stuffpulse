// Clean Seed & Configuration Definitions for Multi-Tenant Velo HR Suite
import { getTodayDateString } from '../utils/dateUtils';

const today = getTodayDateString();

export const INITIAL_COMPANY = {
  id: "comp-default",
  name: "Velo HR Organization",
  brandName: "Velo HR",
  subtitle: "Human Resources | Talent Solutions",
  code: "VELO",
  address: "Corporate Tech Park, Sector 62, Gurugram, India",
  phone: "+91 98765 43210",
  email: "admin@velohr.com",
  adminName: "Company Administrator",
  gstin: "08AAACA1234F1Z8",
  pan: "AAACA1234F",
  currency: "INR",
  currencySymbol: "₹",
  pfRate: 0.12,
  esiRate: 0.0075, // 0.75% standard employee contribution
  professionalTax: 200,
  subscriptionStatus: "active", // 'trial' | 'active' | 'expired'
  planTier: "pro",
  subscriptionExpiresAt: "2026-12-31",
  shiftGracePeriodMins: 15,
  shiftHalfDayThresholdHours: 4.5,
  shiftStartTime: "09:30",
  shiftEndTime: "18:30",
  geofence: {
    lat: 28.4950,
    lng: 77.0895,
    radiusMeters: 200,
    strictEnforcement: true,
    address: "Corporate Tech Park, Sector 62, Gurugram, India",
    branches: [
      { id: "branch-hq", name: "Main Office Campus", lat: 28.4950, lng: 77.0895, radiusMeters: 200, address: "Corporate Tech Park, Sector 62, Gurugram, India" }
    ]
  },
  allowancesConfig: [
    { id: "allw-hra", name: "House Rent Allowance (HRA)", amount: 5000, type: "fixed" },
    { id: "allw-inc", name: "Monthly Performance Incentive", amount: 2500, type: "fixed" },
    { id: "allw-conv", name: "Conveyance / Petrol Allowance", amount: 1500, type: "fixed" },
  ]
};

// All initial collections start empty — ready for real database synchronization or live user registration
export const INITIAL_EMPLOYEES = [];
export const INITIAL_ATTENDANCE = [];
export const INITIAL_EXPENSES = [];
export const INITIAL_LOANS = [];
export const INITIAL_TASKS = [];
