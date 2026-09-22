import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  XCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

const STAGES = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

const getStageIcon = (status, isCurrent, isPassed) => {
  if (status === 'Rejected') {
    return <XCircle className="w-5 h-5 text-rose-600" />;
  }
  if (isPassed || isCurrent) {
    switch (status) {
      case 'Submitted':
        return <FileCheck className="w-5 h-5 text-blue-600" />;
      case 'Verified':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'Assigned':
        return <UserCheck className="w-5 h-5 text-amber-600" />;
      case 'In Progress':
        return <Wrench className="w-5 h-5 text-orange-600 animate-spin" style={{ animationDuration: '4s' }} />;
      case 'Resolved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    }
  }
  return <Clock className="w-5 h-5 text-slate-300" />;
};

const StatusTimeline = ({ currentStatus, statusHistory = [] }) => {
  const isRejected = currentStatus === 'Rejected';
  const stages = isRejected ? ['Submitted', 'Verified', 'Rejected'] : STAGES;
  const currentIndex = stages.indexOf(currentStatus);

  // Map history events to quick lookup
  const historyMap = {};
  statusHistory.forEach((h) => {
    historyMap[h.status] = h;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span>Resolution Progress Timeline</span>
        {isRejected && (
          <span className="text-xs font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
            Complaint Closed
          </span>
        )}
      </h3>

      <div className="relative pl-6 sm:pl-8 space-y-8">
        {/* Connecting Vertical Line */}
        <div className="absolute left-[19px] sm:left-[27px] top-3 bottom-3 w-0.5 bg-slate-200 -z-0" />

        {stages.map((stage, idx) => {
          const isPassed = currentIndex > idx;
          const isCurrent = currentStatus === stage;
          const historyEntry = historyMap[stage];

          return (
            <div key={stage} className="relative flex items-start gap-4 group">
              {/* Icon Marker */}
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-white border-blue-600 ring-4 ring-blue-100 shadow-md'
                    : isPassed
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-300'
                }`}
              >
                {getStageIcon(stage, isCurrent, isPassed)}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-blue-700'
                        : isPassed
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage}
                    {isCurrent && (
                      <span className="ml-2 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Current Stage
                      </span>
                    )}
                  </span>

                  {historyEntry && (
                    <span className="text-xs text-slate-400 font-mono mt-0.5 sm:mt-0">
                      {new Date(historyEntry.changedAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {/* History comment or inspector note */}
                {historyEntry && historyEntry.comment && (
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{historyEntry.comment}"
                    {historyEntry.changedBy?.name && (
                      <span className="block mt-1 text-[11px] text-slate-400 font-medium">
                        — {historyEntry.changedBy.name} ({historyEntry.changedBy.role || 'Officer'})
                      </span>
                    )}
                  </p>
                )}

                {!historyEntry && (
                  <p className="mt-1 text-xs text-slate-400 italic">
                    Awaiting verification and processing
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
