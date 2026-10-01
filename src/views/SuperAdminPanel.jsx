// Super Admin SaaS Platform Command Center (Platform Owner Panel)
import React, { useState } from 'react';
import {
  Crown,
  Building2,
  Users,
  CreditCard,
  LifeBuoy,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  Clock,
  Server,
  Database,
  Radio,
  X,
  FileText,
  Mail,
  Phone,
  Power
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';

export const SuperAdminPanel = () => {
  const {
    tenants,
    supportTickets,
    impersonateTenant,
    resolveTicket,
    addTenant,
    updateTenantStatus,
    navigateTo,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' | 'tickets' | 'system'
  const [tenantSearch, setTenantSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Support tickets filter
  const [ticketSearch, setTicketSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals state
  const [selectedTicketForSolving, setSelectedTicketForSolving] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);

  // New Tenant form state
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    brandName: '',
    code: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    plan: 'Growth Pro',
    city: 'Mumbai, MH',
    industry: 'Logistics',
  });

  // Calculate platform totals
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'Active').length;
  const totalStaff = tenants.reduce((acc, t) => acc + Number(t.staffCount || 0), 0);
  const totalMRR = tenants.filter(t => t.status === 'Active').reduce((acc, t) => acc + Number(t.mrr || 0), 0);
  const openTickets = supportTickets.filter(t => t.status !== 'Resolved').length;

  // Filtered tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.brandName.toLowerCase().includes(tenantSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (planFilter !== 'ALL' && t.plan !== planFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  // Filtered tickets
  const filteredTickets = supportTickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.companyName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(ticketSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const handleImpersonate = (tenant) => {
    impersonateTenant(tenant.id);
  };

  const handleSolveTicketSubmit = (e) => {
    e.preventDefault();
    if (!selectedTicketForSolving) return;
    resolveTicket(selectedTicketForSolving.id, resolutionInput || 'Diagnosed and resolved by SaaS Platform Owner');
    setSelectedTicketForSolving(null);
    setResolutionInput('');
  };

  const handleCreateTenant = (e) => {
    e.preventDefault();
    addTenant({
      ...newTenantData,
      id: `TENANT-${String(tenants.length + 1).padStart(3, '0')}`,
      status: 'Active',
      staffCount: 1,
      mrr: newTenantData.plan === 'Growth Pro' ? 1499 : newTenantData.plan === 'Enterprise Custom' ? 3999 : 0,
      joinedDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payrollProcessedThisMonth: 0,
    });
    setIsAddTenantModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/40">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>SaaS Platform Owner & Super Admin HQ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Multi-Tenant Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              You are the owner of StaffPulse. Monitor all subscribing companies, diagnose and resolve their operational issues, manage subscription billing, and enter any company workspace in 1-click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddTenantModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Company</span>
            </button>

            <button
              onClick={() => navigateTo('app')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition active:scale-95"
            >
              <span>Back to Demo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Global SaaS Platform Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Companies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Companies</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalTenants}</div>
            <p className="text-[11px] text-emerald-400 mt-0.5">{activeTenants} Active Subscribers</p>
          </div>
        </div>

        {/* Monitored Staff */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monitored Staff</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalStaff}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Employees on platform</p>
          </div>
        </div>

        {/* Platform MRR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform MRR</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-400 font-mono">{formatCurrency(totalMRR)}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Recurring SaaS revenue</p>
          </div>
        </div>

        {/* Open Support Issues */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Client Problems</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{openTickets}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Require Super Admin action</p>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-card col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Uptime</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">99.98%</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Firestore 18ms latency</p>
          </div>
        </div>

      </div>

      {/* Super Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'tenants'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Companies Directory ({totalTenants})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition relative ${
            activeTab === 'tickets'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Customer Issues & Problem Solver ({openTickets})</span>
          {openTickets > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'system'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Platform Health & Feature Flags</span>
        </button>
      </div>

      {/* TAB 1: TENANT COMPANIES DIRECTORY */}
      {activeTab === 'tenants' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                placeholder="Search companies by name, code, admin email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Subscription Plans</option>
                <option value="Starter Free">Starter Free</option>
                <option value="Growth Pro">Growth Pro</option>
                <option value="Enterprise Custom">Enterprise Custom</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <th className="py-3 px-5">Company / Business</th>
                  <th className="py-3 px-3">Admin Contact</th>
                  <th className="py-3 px-3">Plan & MRR</th>
                  <th className="py-3 px-3 text-center">Staff Count</th>
                  <th className="py-3 px-3 text-right">Payroll Volume</th>
                  <th className="py-3 px-3 text-center">Account Status</th>
                  <th className="py-3 px-5 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Company */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xs">
                          {tenant.code}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            {tenant.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{tenant.city} • {tenant.industry}</div>
                        </div>
                      </div>
                    </td>

                    {/* Admin Contact */}
                    <td className="py-4 px-3">
                      <div className="font-semibold text-slate-200">{tenant.adminName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tenant.adminEmail}</div>
                      <div className="text-[10px] text-slate-500">{tenant.adminPhone}</div>
                    </td>

                    {/* Plan */}
                    <td className="py-4 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tenant.plan === 'Enterprise Custom'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : tenant.plan === 'Growth Pro'
                          ? 'bg-brand-950 text-brand-300 border border-brand-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {tenant.plan}
                      </span>
                      <div className="text-xs font-mono font-bold text-white mt-1">
                        {tenant.mrr > 0 ? formatCurrency(tenant.mrr) + '/mo' : 'Free Tier'}
                      </div>
                    </td>

                    {/* Staff Count */}
                    <td className="py-4 px-3 text-center">
                      <div className="font-mono font-extrabold text-white text-sm">{tenant.staffCount}</div>
                      <div className="text-[10px] text-slate-400">heads</div>
                    </td>

                    {/* Payroll Volume */}
                    <td className="py-4 px-3 text-right font-mono font-semibold text-slate-300">
                      {formatCurrency(tenant.payrollProcessedThisMonth)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tenant.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : tenant.status === 'Trial'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Impersonate */}
                        <button
                          onClick={() => handleImpersonate(tenant)}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md shadow-purple-600/20 transition active:scale-95"
                          title="Directly enter this company's workspace to fix problems or audit records"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-300" />
                          <span>Enter Workspace</span>
                        </button>

                        {/* Status Toggle */}
                        {tenant.status === 'Suspended' ? (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, 'Active')}
                            className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 transition"
                            title="Restore Company Account"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, 'Suspended')}
                            className="p-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 hover:bg-rose-900 transition"
                            title="Suspend Company Account"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: CUSTOMER PROBLEM RESOLUTION HUB */}
      {activeTab === 'tickets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" />
                <span>Tenant Issue Triage & Problem Solving Console</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect customer-reported problems across payroll formulas, GPS punches, or billing, and resolve them directly
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="divide-y divide-slate-800 p-2">
            {filteredTickets.map((ticket) => {
              const tenant = tenants.find(t => t.id === ticket.tenantId);

              return (
                <div key={ticket.id} className="p-5 hover:bg-slate-800/40 transition rounded-2xl space-y-3">
                  
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ticket.priority === 'Urgent'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : ticket.priority === 'High'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{ticket.id}</span>
                      <span className="text-xs font-bold text-purple-400">{ticket.companyName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-medium text-slate-300">Category: {ticket.category}</span>
                      <span>•</span>
                      <span>{formatDate(ticket.createdAt, 'short')}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Subject & Description */}
                  <div>
                    <h3 className="font-extrabold text-white text-base">{ticket.subject}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      "{ticket.description}"
                    </p>
                  </div>

                  {/* Suggested Root Cause & Action */}
                  <div className="bg-purple-950/30 border border-purple-800/40 p-3 rounded-xl flex items-center justify-between text-xs gap-3">
                    <div className="text-slate-300">
                      <span className="font-bold text-purple-300">Super Admin Diagnostic Tip:</span> {ticket.suggestedAction}
                    </div>

                    {ticket.status !== 'Resolved' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        {tenant && (
                          <button
                            onClick={() => handleImpersonate(tenant)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                            <span>Inspect Workspace</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTicketForSolving(ticket)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-extrabold text-xs rounded-lg shadow-xs transition"
                        >
                          Solve & Resolve
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved: {ticket.adminResolutionNotes}</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 3: PLATFORM INFRASTRUCTURE & SETTINGS */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Multi-Tenant Database & Cloud Storage</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Firestore Read/Write Pool:</span>
                <span className="font-mono font-bold text-emerald-400">Active (18ms avg latency)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Biometric Receipt Storage Bucket:</span>
                <span className="font-mono font-bold text-slate-200">4.2 GB of 50 GB Used (8.4%)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Authenticated Sessions:</span>
                <span className="font-mono font-bold text-slate-200">122 Active JWT tokens</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Scheduled Nightly Backups:</span>
                <span className="font-mono font-bold text-emerald-400">Enabled (Every day 02:00 AM UTC)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Global Platform Feature Flags</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Biometric Selfie Geofencing</span>
                  <span className="text-[11px] text-slate-400">Enforce camera & GPS verification across all tenants</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-brand-600 w-4 h-4" />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Automated Loan EMI Deductions</span>
                  <span className="text-[11px] text-slate-400">Auto-subtract active monthly loans on payslips</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-brand-600 w-4 h-4" />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">One-Click PDF Payslip Generator</span>
                  <span className="text-[11px] text-slate-400">Permit company admins to print and export payslips</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-brand-600 w-4 h-4" />
              </label>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: SOLVE PROBLEM / RESOLVE TICKET */}
      {selectedTicketForSolving && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Super Admin Problem Solver</h3>
              </div>
              <button
                onClick={() => setSelectedTicketForSolving(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket ID:</span>
                <span className="font-mono font-bold text-slate-200">{selectedTicketForSolving.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-bold text-purple-400">{selectedTicketForSolving.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="font-semibold text-white">{selectedTicketForSolving.subject}</span>
              </div>
            </div>

            <form onSubmit={handleSolveTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Super Admin Resolution Notes & Fix Applied:
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g., Audited warehouse daily wage formula. Adjusted the weekly off multiplier and updated policy setting. Verified on the payslip."
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForSolving(null)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Mark as Resolved & Notify Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ONBOARD NEW TENANT COMPANY */}
      {isAddTenantModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-extrabold text-white">Register New Tenant Company</h3>
              </div>
              <button
                onClick={() => setIsAddTenantModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., QuickCargo Fleet Pvt Ltd"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., QuickCargo"
                    value={newTenantData.brandName}
                    onChange={(e) => setNewTenantData({ ...newTenantData, brandName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., QCF"
                    value={newTenantData.code}
                    onChange={(e) => setNewTenantData({ ...newTenantData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Primary Admin Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rajesh Sharma"
                    value={newTenantData.adminName}
                    onChange={(e) => setNewTenantData({ ...newTenantData, adminName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@quickcargo.in"
                    value={newTenantData.adminEmail}
                    onChange={(e) => setNewTenantData({ ...newTenantData, adminEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={newTenantData.plan}
                    onChange={(e) => setNewTenantData({ ...newTenantData, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Starter Free">Starter Free (₹0)</option>
                    <option value="Growth Pro">Growth Pro (₹1,499/mo)</option>
                    <option value="Enterprise Custom">Enterprise Custom (₹3,999/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g., Mumbai, MH"
                    value={newTenantData.city}
                    onChange={(e) => setNewTenantData({ ...newTenantData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTenantModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold rounded-xl"
                >
                  Register Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
