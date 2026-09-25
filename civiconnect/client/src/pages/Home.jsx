import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import ComplaintCard from '../components/ComplaintCard';
import MapView from '../components/MapView';
import {
  Search,
  Filter,
  Grid3X3,
  Map as MapIcon,
  RefreshCw,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import FAQ from '../components/FAQ';

const categories = [
  { id: 'all', label: 'All Issues' },
  { id: 'road', label: 'Roads & Potholes' },
  { id: 'waste', label: 'Garbage & Waste' },
  { id: 'water', label: 'Water Supply' },
  { id: 'streetlight', label: 'Streetlights' },
  { id: 'drainage', label: 'Drainage' },
  { id: 'other', label: 'Other' },
];

const statuses = [
  'all',
  'Submitted',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

const Home = () => {
  const { socket } = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch complaints from REST API
  const fetchComplaints = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
      };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      toast.error('Could not load complaints feed.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters or page change
  useEffect(() => {
    fetchComplaints(page);
  }, [selectedCategory, selectedStatus, page]);

  // Handle live Socket.IO events on feed
  useEffect(() => {
    if (!socket) return;

    // Listen for new complaints submitted in real time
    const handleNewComplaint = (newComplaint) => {
      console.log('[Socket] New complaint received on feed:', newComplaint);
      // Prepend to feed if matches current filter or if on 'all'
      setComplaints((prev) => {
        // Prevent duplicate
        if (prev.some((c) => c._id === newComplaint._id)) return prev;
        return [newComplaint, ...prev];
      });
      setTotalCount((prev) => prev + 1);
      toast(
        (t) => (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <p className="text-xs font-bold text-slate-800">New Complaint Reported!</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{newComplaint.title}</p>
            </div>
          </div>
        ),
        { icon: '📢', duration: 4000 }
      );
    };

    // Listen for real-time status transitions
    const handleStatusUpdate = ({ complaintId, newStatus, statusHistory, updatedComplaint }) => {
      console.log('[Socket] Status update on feed:', complaintId, newStatus);
      setComplaints((prev) =>
        prev.map((c) => {
          if (c._id === complaintId) {
            return {
              ...c,
              status: newStatus,
              statusHistory: statusHistory || c.statusHistory,
            };
          }
          return c;
        })
      );
    };

    // Listen for real-time complaint deletion
    const handleComplaintDeleted = ({ complaintId }) => {
      console.log('[Socket] Complaint deleted, removing from public feed:', complaintId);
      setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
      setTotalCount((prev) => Math.max(0, prev - 1));
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints(1);
  };

  const handleUpvoteChange = (complaintId, updatedUpvotes) => {
    setComplaints((prev) =>
      prev.map((c) => (c._id === complaintId ? { ...c, upvotes: updatedUpvotes } : c))
    );
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Real-Time Municipal Action Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Empowering Citizens, Accelerating Civic Resolutions.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Report road hazards, sanitation backlogs, water leaks, and street faults.
            Track municipal field updates in real time with interactive maps and live audit trails.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto pt-4 flex items-center bg-white rounded-2xl shadow-xl p-1.5 text-slate-800 pb-4"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by keywords, pothole, street, or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-slate-800 focus:outline-none placeholder-slate-400 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Decorative background gradient circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 p-10 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right side: Status filter & View Switcher */}
          <div className="flex items-center gap-3 self-end lg:self-auto shrink-0 pt-8">
            {/* Status Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st === 'all' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid / Map toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchComplaints(page)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Results Counter Banner */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing {complaints.length} of {totalCount} Civic Issues Reported
          </p>
        </div>

        {/* View Mode: MAP VIEW */}
        {viewMode === 'map' && (
          <div className="mb-12">
            <MapView complaints={complaints} height="560px" />
          </div>
        )}

        {/* View Mode: GRID VIEW */}
        {viewMode === 'grid' && (
          <>
            {loading ? (
              // Loading Skeleton Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-4 h-80 animate-pulse flex flex-col justify-between"
                  >
                    <div className="w-full h-40 bg-slate-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-slate-200 rounded" />
                      <div className="w-1/2 h-3 bg-slate-100 rounded" />
                    </div>
                    <div className="w-full h-8 bg-slate-100 rounded-lg mt-4" />
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Complaints Found</h3>
                <p className="text-sm text-slate-500 mt-1">
                  There are currently no civic complaints matching your selected category, status,
                  or search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSearch('');
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              // Cards Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((c) => (
                  <ComplaintCard
                    key={c._id}
                    complaint={c}
                    onUpvoteChange={handleUpvoteChange}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-medium text-slate-500 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

       <FAQ />
    </div>
  );
};

export default Home;
