import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import MapView from '../components/MapView';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  Clock,
  Send,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Wrench,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { socket, joinComplaintRoom, leaveComplaintRoom } = useSocket();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  // Fetch initial complaint data
  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
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

  // Join Socket room for this specific complaint
  useEffect(() => {
    if (!socket || !id) return;

    joinComplaintRoom(id);

    // Real-time status updates
    const handleStatusUpdate = ({ complaintId, newStatus, statusHistory, updatedComplaint }) => {
      if (complaintId === id) {
        console.log('[Socket Room] Live status update for this complaint:', newStatus);
        setComplaint((prev) => ({
          ...prev,
          status: newStatus,
          statusHistory: statusHistory || prev.statusHistory,
          ...(updatedComplaint || {}),
        }));
        toast.success(`Resolution Status Updated: ${newStatus}`, { icon: '🔄' });
      }
    };

    // Real-time comments
    const handleNewComment = ({ complaintId, comment }) => {
      if (complaintId === id) {
        console.log('[Socket Room] Live comment received:', comment);
        setComplaint((prev) => {
          if (!prev) return prev;
          // Avoid duplicate comments
          if (prev.comments?.some((c) => c._id === comment._id)) return prev;
          return {
            ...prev,
            comments: [...(prev.comments || []), comment],
          };
        });
      }
    };

    // Real-time department assignment
    const handleAssigned = (data) => {
      if (data.complaintId === id) {
        setComplaint((prev) => ({
          ...prev,
          assignedDepartment: data.assignedDepartment || prev.assignedDepartment,
          assignedWorker: data.assignedWorker || prev.assignedWorker,
          status: data.status || prev.status,
          statusHistory: data.statusHistory || prev.statusHistory,
        }));
        toast.success(`Assigned to ${data.assignedDepartment || 'Department'}`);
      }
    };

    // Real-time deletion
    const handleComplaintDeleted = (data) => {
      if (data.complaintId === id) {
        toast.error('This complaint was removed by municipal administrators.', { icon: '🗑️' });
        navigate('/', { replace: true });
      }
    };

    socket.on('complaint:statusUpdate', handleStatusUpdate);
    socket.on('complaint:comment', handleNewComment);
    socket.on('complaint:assigned', handleAssigned);
    socket.on('complaint:deleted', handleComplaintDeleted);

    return () => {
      leaveComplaintRoom(id);
      socket.off('complaint:statusUpdate', handleStatusUpdate);
      socket.off('complaint:comment', handleNewComment);
      socket.off('complaint:assigned', handleAssigned);
      socket.off('complaint:deleted', handleComplaintDeleted);
    };
  }, [socket, id]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to upvote issues.');
      return;
    }

    if (upvoting) return;
    setUpvoting(true);

    try {
      const res = await api.post(`/complaints/${id}/upvote`);
      if (res.data.success) {
        setComplaint((prev) => ({
          ...prev,
          upvotes: res.data.upvotes,
        }));
        toast.success(res.data.upvoted ? 'Upvoted! Me too count increased.' : 'Upvote removed.');
      }
    } catch (err) {
      toast.error('Failed to upvote.');
    } finally {
      setUpvoting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please log in to leave a comment.');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        text: newComment.trim(),
      });
      if (res.data.success) {
        setNewComment('');
        // Socket listener will automatically append the comment
      }
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-500">Loading civic complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">The requested civic issue record does not exist or was removed.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Public Feed
        </Link>
      </div>
    );
  }

  const hasUpvoted = user && complaint.upvotes?.some((uid) => (uid._id || uid) === user._id);
  const photo = getImageUrl(complaint.photoUrl);
  const resolutionPhoto = getImageUrl(complaint.resolutionPhotoUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Admin Switch */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Public Feed
        </Link>

        {isAdmin && (
          <Link
            to={`/admin/complaints/${complaint._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Admin Controls View
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Complaint Details & Media (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {complaint.category} Issue
                </span>
                <StatusBadge status={complaint.status} size="md" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {complaint.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reported by {complaint.createdBy?.name || 'Citizen'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(complaint.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{complaint.location?.address}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Problem Description
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* Assigned Department Badge (if assigned) */}
            {complaint.assignedDepartment && (
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <Wrench className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">
                    Assigned Department: {complaint.assignedDepartment}
                  </p>
                  {complaint.assignedWorker && (
                    <p className="text-amber-800 mt-0.5">
                      Designated Field Worker: {complaint.assignedWorker}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Photos Section: Issue Photo + Resolution Photo */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Photographic Documentation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photo ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                    <div className="px-3 py-1.5 bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-between">
                      <span>Reported Evidence</span>
                      <span className="text-slate-400">Citizen Photo</span>
                    </div>
                    <img
                      src={photo}
                      alt="Reported Issue"
                      className="w-full h-56 object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mb-2" />
                    <span className="text-xs">No issue photo attached</span>
                  </div>
                )}

                {resolutionPhoto ? (
                  <div className="rounded-2xl overflow-hidden border border-emerald-300 bg-slate-900">
                    <div className="px-3 py-1.5 bg-emerald-700 text-white text-[11px] font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Municipal Proof of Resolution
                      </span>
                    </div>
                    <img
                      src={resolutionPhoto}
                      alt="Proof of Resolution"
                      className="w-full h-56 object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 mb-2 text-slate-300" />
                    <span className="text-xs">Awaiting resolution proof photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upvote & Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  hasUpvoted
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-white' : ''}`} />
                <span>{hasUpvoted ? 'Upvoted (Me too)' : 'Support Issue (Me too)'}</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-black/10">
                  {complaint.upvotes?.length || 0}
                </span>
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Complaint ID: {complaint._id.slice(-8)}
              </span>
            </div>
          </div>

          {/* Location Map View */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Exact Geographical Pinpoint</span>
            </h3>
            <MapView complaints={[complaint]} zoom={15} height="320px" />
          </div>

          {/* Real-time Community Comments Section */}
          <div id="comments" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Community Discussion</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  {complaint.comments?.length || 0}
                </span>
              </h3>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {complaint.comments && complaint.comments.length > 0 ? (
                complaint.comments.map((comment, idx) => (
                  <div key={comment._id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {comment.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {comment.user?.name || 'Citizen'}
                        </span>
                        {comment.user?.role === 'admin' && (
                          <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                            Official
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(comment.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 pl-8 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No comments yet. Be the first to share an update or confirm this issue!
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? 'Post an update or corroboration...'
                    : 'Please log in to add a comment...'
                }
                disabled={!isAuthenticated || submittingComment}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || submittingComment || !newComment.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Dynamic Status Timeline & Ward Info (1 col) */}
        <div className="space-y-6">
          {/* Vertical Status Timeline */}
          <StatusTimeline
            currentStatus={complaint.status}
            statusHistory={complaint.statusHistory}
          />

          {/* Administrative Action Notes */}
          {complaint.adminNotes && complaint.adminNotes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Official Municipal Notes</span>
              </h4>
              <div className="space-y-3">
                {complaint.adminNotes.map((an, i) => (
                  <div key={i} className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs">
                    <p className="text-indigo-950 font-medium leading-relaxed">
                      "{an.note}"
                    </p>
                    <span className="block mt-1 text-[10px] text-indigo-500 font-mono">
                      Added on {new Date(an.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
