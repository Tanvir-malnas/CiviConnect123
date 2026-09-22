import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { getImageUrl } from '../api/axiosInstance';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  Clock,
  AlertTriangle,
  Droplets,
  Trash2,
  Lightbulb,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';

const categoryIcons = {
  road: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Road & Potholes' },
  waste: { icon: Trash2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Garbage & Waste' },
  water: { icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Water Supply' },
  streetlight: { icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Streetlight' },
  drainage: { icon: GitPullRequest, color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Drainage' },
  other: { icon: AlertTriangle, color: 'text-slate-600 bg-slate-50 border-slate-200', label: 'Civic Other' },
};

const ComplaintCard = ({ complaint, onUpvoteChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [upvotes, setUpvotes] = useState(complaint.upvotes || []);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const hasUpvoted = user && upvotes.some((id) => (id._id || id) === user._id);
  const cat = categoryIcons[complaint.category] || categoryIcons.other;
  const CategoryIcon = cat.icon;

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to upvote civic issues.');
      return;
    }

    if (isUpvoting) return;
    setIsUpvoting(true);

    try {
      const res = await api.post(`/complaints/${complaint._id}/upvote`);
      if (res.data.success) {
        setUpvotes(res.data.upvotes);
        if (onUpvoteChange) {
          onUpvoteChange(complaint._id, res.data.upvotes);
        }
      }
    } catch (err) {
      toast.error('Could not register your upvote.');
    } finally {
      setIsUpvoting(false);
    }
  };

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const photo = getImageUrl(complaint.photoUrl);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Thumbnail or Category Banner */}
      <Link to={`/complaints/${complaint._id}`} className="relative h-48 w-full bg-slate-100 overflow-hidden block">
        {photo ? (
          <img
            src={photo}
            alt={complaint.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <CategoryIcon className="w-12 h-12 stroke-[1.5] mb-2 text-slate-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              No Photo Attached
            </span>
          </div>
        )}

        {/* Floating Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border backdrop-blur-md bg-white/90 ${cat.color}`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            {cat.label}
          </span>
        </div>

        {/* Floating Status Badge */}
        <div className="absolute top-3 right-3 shadow-sm">
          <StatusBadge status={complaint.status} />
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Address Snippet */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{complaint.location?.address || 'Location Specified on Map'}</span>
          </div>

          {/* Title */}
          <Link to={`/complaints/${complaint._id}`}>
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
              {complaint.title}
            </h3>
          </Link>

          {/* Description Snippet */}
          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Card Footer: Metadata & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {/* Upvote button */}
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                hasUpvoted
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Click to support ('Me too!')"
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-blue-600 text-blue-600' : ''}`}
              />
              <span>{upvotes.length} Me too</span>
            </button>

            {/* Comment counter */}
            <Link
              to={`/complaints/${complaint._id}#comments`}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{complaint.comments?.length || 0}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
