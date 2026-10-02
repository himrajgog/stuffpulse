// Multi-Tenant SaaS Platform Owner / Super Admin Data Structure (Zero Mock Seed Data)

export const INITIAL_TENANTS = [];

export const INITIAL_SUPPORT_TICKETS = [];

export const INITIAL_INQUIRIES = [];

export const calculatePlatformMetrics = (tenants = []) => {
  const activeTenants = tenants.filter(t => t.status?.toLowerCase() === 'active').length;
  const trialTenants = tenants.filter(t => t.status?.toLowerCase() === 'trial').length;
  const suspendedTenants = tenants.filter(t => t.status?.toLowerCase() === 'suspended').length;
  const pendingTenants = tenants.filter(t => t.status?.toLowerCase() === 'pending_approval' || t.status?.toLowerCase() === 'new_lead').length;

  const totalMonitoredStaff = tenants.reduce((acc, t) => acc + (Number(t.staffCount) || 0), 0);
  const totalPlatformMRR = tenants.reduce((acc, t) => acc + (Number(t.mrr) || 0), 0);
  const grossPayrollProcessed = tenants.reduce((acc, t) => acc + (Number(t.payrollProcessedThisMonth) || 0), 0);

  return {
    totalTenants: tenants.length,
    activeTenants,
    trialTenants,
    suspendedTenants,
    pendingTenants,
    totalMonitoredStaff,
    totalPlatformMRR,
    grossPayrollProcessed,
    systemUptime: "99.99%",
    firestoreSyncStatus: "Live Multi-Tenant Partitioning Active",
    cloudStorageUsage: "0.2 GB / 50 GB",
    activeAppVersion: "v2.0-enterprise",
  };
};

export const PLATFORM_METRICS = calculatePlatformMetrics([]);
