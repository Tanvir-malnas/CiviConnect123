import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../api/axiosInstance';
import StatusBadge from '../../components/StatusBadge';
import StatusTimeline from '../../components/StatusTimeline';
import MapView from '../../components/MapView';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  UserCheck,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  FileEdit,
  Send,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const municipalDepartments = [
  'Roads & Traffic Dept',
  'Solid Waste Management (SWM)',
  'Hydraulic Engineering Dept',
  'Electrical & Power Supply Dept',
  'Sewerage Operations Dept',
  'Garden & Tree Authority',
  'Health & Sanitation Dept',
  'Disaster Management Cell',
];

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Status Form state
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assignment Form state
  const [department, setDepartment] = useState('');
  const [worker, setWorker] = useState('');
  const [updatingAssignment, setUpdatingAssignment] = useState(false);

  // Resolution Photo Upload state
  const [resolutionFile, setResolutionFile] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const handleDeleteComplaint = async () => {
    const confirm = window.confirm(
      `Are you sure you want to permanently delete this complaint?\n\n"${complaint?.title}"\n\nThis action cannot be undone.`
    );
    if (!confirm) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/admin/complaints/${id}`);
      if (res.data.success) {
        toast.success('Complaint permanently removed.');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error('Failed to delete complaint.');
      setDeleting(false);
    }
  };

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setStatus(res.data.complaint.status);
        setDepartment(res.data.complaint.assignedDepartment || '');
        setWorker(res.data.complaint.assignedWorker || '');
      }
    } catch (err) {
      console.error('Failed to load complaint:', err);
      toast.error('Could not load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/admin/complaints/${id}/status`, {
        status,
        note: statusNote.trim(),
      });
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setStatusNote('');
        toast.success(`Status updated to ${status}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle department & worker assignment
  const handleAssignment = async (e) => {
    e.preventDefault();
    setUpdatingAssignment(true);
    try {
      const res = await api.patch(`/admin/complaints/${id}/assign`, {
        department,
        worker: worker.trim(),
      });
      if (res.data.success) {
        setComplaint(res.data.complaint);
        toast.success('Assignment saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save assignment.');
    } finally {
      setUpdatingAssignment(false);
    }
  };

  // Handle resolution photo upload
  const handleResolutionUpload = async (e) => {
    e.preventDefault();
    if (!resolutionFile) {
      toast.error('Please select an image file to upload.');
      return;
    }

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('photo', resolutionFile);
      formData.append('markResolved', 'true');

      const res = await api.post(`/admin/complaints/${id}/resolution-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setComplaint(res.data.complaint);
        setStatus('Resolved');
        setResolutionFile(null);
        setResolutionPreview(null);
        toast.success('Resolution photo uploaded! Complaint marked Resolved.');
      }
    } catch (err) {
      toast.error('Failed to upload proof photo.');
    } finally {
      setUploadingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-semibold">Loading municipal management controls...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <Link to="/admin/dashboard" className="mt-4 text-xs font-semibold text-indigo-600 hover:underline">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  const citizenPhoto = getImageUrl(complaint.photoUrl);
  const resolutionPhoto = getImageUrl(complaint.resolutionPhotoUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/complaints/${complaint._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            View Public Citizen Page
          </Link>
          <button
            onClick={handleDeleteComplaint}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Deleting...' : 'Delete Complaint'}</span>
          </button>
        </div>
      </div>

      {/* Main Admin Header */}
      <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-indigo-800 text-indigo-200">
                Grievance #{complaint._id.slice(-6)}
              </span>
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-indigo-700/80 text-white">
                Category: {complaint.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {complaint.title}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{complaint.location?.address}</span>
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
            <span className="text-xs text-indigo-200 block mb-1">Current State</span>
            <StatusBadge status={complaint.status} size="md" />
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Admin Control Panels (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Status Transition & Audit Note Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Update Resolution Status & Audit Log
              </h3>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select New Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Verified">Verified</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Audit Note (Shown on Public Timeline)
                  </label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Ward inspector completed on-site assessment. Asphalt patch team scheduled."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {updatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileEdit className="w-3.5 h-3.5" />
                )}
                <span>Update Status</span>
              </button>
            </form>
          </div>

          {/* 2. Assign Department & Worker */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Department & Field Personnel Assignment
              </h3>
            </div>

            <form onSubmit={handleAssignment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designated Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- Choose Municipal Dept --</option>
                    {municipalDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designated Field Worker / Engineer
                  </label>
                  <input
                    type="text"
                    value={worker}
                    onChange={(e) => setWorker(e.target.value)}
                    placeholder="e.g. Suresh Patil (Zone Lead)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingAssignment}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {updatingAssignment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span>Save Assignment</span>
              </button>
            </form>
          </div>

          {/* 3. Upload Proof of Resolution */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Upload Municipal Proof of Resolution
              </h3>
            </div>

            {resolutionPhoto ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={resolutionPhoto}
                  alt="Resolution Proof"
                  className="w-36 h-28 object-cover rounded-xl border border-emerald-300 shadow-sm"
                />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Resolution Proof Active
                  </span>
                  <p className="text-emerald-700">
                    Proof photo has been verified and displayed on public channels.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResolutionUpload} className="space-y-4">
                <p className="text-xs text-slate-500">
                  Upload a photo of the completed municipal work (e.g. repaved road, cleared bin,
                  repaired line). Submitting will automatically transition the status to **Resolved**.
                </p>

                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) {
                        setResolutionFile(f);
                        setResolutionPreview(URL.createObjectURL(f));
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />

                  {resolutionPreview && (
                    <img
                      src={resolutionPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploadingProof || !resolutionFile}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {uploadingProof ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload Proof & Mark Resolved</span>
                </button>
              </form>
            )}
          </div>

          {/* Citizen Description & Photo Comparison */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Original Citizen Report Information</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {complaint.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {citizenPhoto ? (
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Citizen Reported Photo:</span>
                  <img
                    src={citizenPhoto}
                    alt="Citizen complaint"
                    className="w-full h-44 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              ) : (
                <div className="h-44 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                  No citizen photo attached
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Location Map Pin:</span>
                <MapView complaints={[complaint]} zoom={15} height="176px" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Status Timeline (1 col) */}
        <div className="space-y-6">
          <StatusTimeline
            currentStatus={complaint.status}
            statusHistory={complaint.statusHistory}
          />

          {/* Citizen Contact Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-slate-800">Complainant Information</h4>
            <p className="text-slate-600">
              <span className="font-semibold text-slate-700">Name:</span> {complaint.createdBy?.name}
            </p>
            <p className="text-slate-600">
              <span className="font-semibold text-slate-700">Email:</span> {complaint.createdBy?.email}
            </p>
            <p className="text-slate-600">
              <span className="font-semibold text-slate-700">Filed On:</span>{' '}
              {new Date(complaint.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintDetail;
