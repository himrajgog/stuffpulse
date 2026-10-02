// Clean Seed & Configuration Definitions for Multi-Tenant Velo HR Suite
import { getTodayDateString } from '../utils/dateUtils';

const today = getTodayDateString();

export const INITIAL_COMPANY = {
  id: "comp-001",
  name: "Apex Logistics & Retail Solutions",
  brandName: "Velo HR",
  code: "VELO",
  address: "Plot 42, Mansarovar Industrial Area, Jaipur, Rajasthan 302020",
  phone: "+91 98765 43210",
  email: "admin@apexcorp.com",
  adminName: "HR Administrator",
  gstin: "08AAACA1234F1Z8",
  pan: "AAACA1234F",
  currency: "INR",
  currencySymbol: "₹",
  pfRate: 0.12,
  esiRate: 0.0125, // 1.25%
  professionalTax: 200,
  subscriptionStatus: "active", // 'trial' | 'active' | 'expired'
  planTier: "pro",
  subscriptionExpiresAt: "2026-12-31",
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
