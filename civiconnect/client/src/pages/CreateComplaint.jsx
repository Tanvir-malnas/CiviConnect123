import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import MapPicker from '../components/MapPicker';
import {
  Upload,
  X,
  AlertTriangle,
  Droplets,
  Trash2,
  Lightbulb,
  GitPullRequest,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const categoryOptions = [
  { value: 'road', label: 'Roads & Potholes', icon: AlertTriangle },
  { value: 'waste', label: 'Garbage & Waste', icon: Trash2 },
  { value: 'water', label: 'Water Supply', icon: Droplets },
  { value: 'streetlight', label: 'Streetlights', icon: Lightbulb },
  { value: 'drainage', label: 'Drainage & Sewers', icon: GitPullRequest },
  { value: 'other', label: 'Other Civic Hazards', icon: AlertTriangle },
];

const CreateComplaint = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [location, setLocation] = useState({
    lat: 19.0760,
    lng: 72.8777,
    address: 'Mumbai Central, Maharashtra, India',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a title and description.');
      return;
    }

    if (!location.address?.trim()) {
  toast.error('Please enter the complaint location or address.');
  return;
}

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      formData.append('address', location.address || '');

      if (file) {
        formData.append('photo', file);
      }

      const res = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        toast.success('Complaint filed successfully! Broadcasted live.');
        navigate(`/complaints/${res.data.complaint._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="border-b border-slate-100 pb-6 mb-8">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
            Citizen Grievance Submission
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Report a Civic Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provide details, photograph evidence, and pin the exact street location to notify local
            ward authorities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-3">
              Select Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-semibold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Complaint Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="e.g. Dangerous deep pothole outside metro exit #2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <span className="text-[11px] text-slate-400 font-mono mt-1 block text-right">
                {title.length}/120
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe the severity, when it started, how it affects public movement, or any immediate hazards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* 3. Photo Upload with Live Preview */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Attach Photograph Evidence <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-md h-64 bg-slate-900 group">
                <img
                  src={previewUrl}
                  alt="Complaint Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-8 cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to upload or drag photo here
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 4. Interactive Map Location Picker */}
          <div className="pt-2">
            <MapPicker location={location} onChange={setLocation} />
          </div>

          {/* 5. Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Broadcasting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
