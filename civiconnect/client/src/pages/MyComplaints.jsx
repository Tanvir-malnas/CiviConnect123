import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import ComplaintCard from '../components/ComplaintCard';
import { FileText, PlusCircle, Inbox, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MyComplaints = () => {
  const { socket } = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const res = await api.get('/complaints/mine');
        if (res.data.success) {
          setComplaints(res.data.complaints);
        }
      } catch (err) {
        console.error('Failed to load user complaints:', err);
        toast.error('Could not load your complaints.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDeleted = ({ complaintId }) => {
      setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
    };

    const handleStatus = ({ complaintId, newStatus, statusHistory }) => {
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId
            ? { ...c, status: newStatus, statusHistory: statusHistory || c.statusHistory }
            : c
        )
      );
    };

    socket.on('complaint:deleted', handleDeleted);
    socket.on('complaint:statusUpdate', handleStatus);

    return () => {
      socket.off('complaint:deleted', handleDeleted);
      socket.off('complaint:statusUpdate', handleStatus);
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              My Reported Complaints
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time resolution progress and updates for issues you submitted.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <p className="text-sm text-slate-500 font-medium">Fetching your complaints history...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">You haven't filed any complaints yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Noticed a civic hazard like an open pothole or broken streetlight? Report it to initiate
            swift municipal action.
          </p>
          <Link
            to="/complaints/new"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File Your First Report</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
