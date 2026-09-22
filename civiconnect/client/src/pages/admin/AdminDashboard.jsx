import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';
import MapView from '../../components/MapView';
import {
  LayoutDashboard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Map as MapIcon,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Building2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { socket } = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'map'

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchAdminComplaints = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
      toast.error('Could not fetch municipal complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminComplaints();
  }, [statusFilter, categoryFilter, departmentFilter]);

  // Real-time socket listener on admin dashboard
  useEffect(() => {
    if (!socket) return;

    const handleNewComplaint = (newComplaint) => {
      console.log('[Admin Dashboard] Live complaint incoming:', newComplaint);
      setComplaints((prev) => [newComplaint, ...prev]);
      toast(
        (t) => (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
            <div>
              <p className="text-xs font-bold text-slate-800">New Incident Dispatched</p>
              <p className="text-[11px] text-slate-500">{newComplaint.title}</p>
            </div>
          </div>
        ),
        { icon: '🚨', duration: 5000 }
      );
    };

    const handleStatusUpdate = ({ complaintId, newStatus }) => {
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: newStatus } : c))
      );
    };

    const handleComplaintDeleted = ({ complaintId }) => {
      setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
    };

    socket.on('complaint:new', handleNewComplaint);
    socket.on('complaint:statusUpdate', handleStatusUpdate);
    socket.on('complaint:deleted', handleComplaintDeleted);

    return () => {
      socket.off('complaint:new', handleNewComplaint);
      socket.off('complaint:statusUpdate', handleStatusUpdate);
      socket.off('complaint:deleted', handleComplaintDeleted);
    };
  }, [socket]);

  const handleDeleteComplaint = async (complaintId, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete this complaint?\n\n"${title}"\n\nThis will remove it from all public feeds and records.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/admin/complaints/${complaintId}`);
      if (res.data.success) {
        setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
        toast.success('Complaint permanently deleted.');
      }
    } catch (err) {
      toast.error('Failed to delete complaint.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminComplaints();
  };

  // Quick stat counts
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const pendingCount = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Verified').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-600">
                Municipal Command Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Admin Grievance Operations
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch departments, track field technician progress, and upload resolution proof.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/analytics"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            View Analytics & KPIs
          </Link>
          <button
            onClick={fetchAdminComplaints}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Complaints"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Complaints</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Awaiting Dispatch</p>
            <p className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Active In Field</p>
            <p className="text-2xl font-extrabold text-orange-900 mt-1">{inProgressCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Closed & Resolved</p>
            <p className="text-2xl font-extrabold text-emerald-900 mt-1">{resolvedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Geographic Ward Map</span>
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search title, address, worker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shrink-0 shadow-sm"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Category:
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="road">Roads & Potholes</option>
              <option value="waste">Garbage & Waste</option>
              <option value="water">Water Supply</option>
              <option value="streetlight">Streetlights</option>
              <option value="drainage">Drainage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Assigned Dept:
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Roads & Traffic Dept">Roads & Traffic Dept</option>
              <option value="Solid Waste Management (SWM)">Solid Waste Management</option>
              <option value="Hydraulic Engineering Dept">Hydraulic Engineering (Water)</option>
              <option value="Electrical & Power Supply Dept">Electrical & Streetlights</option>
              <option value="Sewerage Operations Dept">Sewerage & Drainage</option>
              <option value="Garden & Tree Authority">Garden & Tree Authority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tab View: Map or List */}
      {activeTab === 'map' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">
              Plotting {complaints.length} municipal incidents on Leaflet map
            </span>
          </div>
          <MapView complaints={complaints} height="580px" isAdminView={true} />
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Complaint & Category</th>
                  <th className="px-6 py-3.5">Reported By</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned Department</th>
                  <th className="px-6 py-3.5">Reported Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No complaints match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-xs">
                          <Link
                            to={`/admin/complaints/${c._id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 text-sm"
                          >
                            {c.title}
                          </Link>
                          <span className="text-[11px] text-slate-500 capitalize mt-0.5">
                            Category: {c.category}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                        <span className="font-medium">{c.createdBy?.name || 'Citizen'}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={c.status} size="xs" />
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {c.assignedDepartment ? (
                          <div>
                            <span className="font-medium text-slate-800 block line-clamp-1">
                              {c.assignedDepartment}
                            </span>
                            {c.assignedWorker && (
                              <span className="text-[11px] text-slate-400">
                                Worker: {c.assignedWorker}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-600 italic font-medium">Unassigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/complaints/${c._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteComplaint(c._id, c.title)}
                          title="Permanently Delete Complaint"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
