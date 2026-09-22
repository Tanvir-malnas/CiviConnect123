import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  PhoneCall,
  ShieldCheck,
  Radio,
  ExternalLink,
  Mail,
  Heart,
  Globe,
  AlertTriangle,
  Flame,
  Ambulance,
  Phone,
  FileText,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1 & 2: Brand, Mission & Live Status */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CiviConnect
              </span>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              An open, real-time civic grievance redressal and municipal transparency system.
              Empowering citizens to report neighborhood hazards and track field team resolutions
              with complete accountability.
            </p>

            {/* Live Status Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Municipal Network Operational & Synchronized</span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Public Complaints Feed
                </Link>
              </li>
              <li>
                <Link to="/complaints/new" className="hover:text-blue-400 transition-colors">
                  Report a Civic Hazard
                </Link>
              </li>
              <li>
                <Link to="/my-complaints" className="hover:text-blue-400 transition-colors">
                  Track My Complaints
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                  <span>Admin Command Console</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">STAFF</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/analytics" className="hover:text-blue-400 transition-colors">
                  Municipal Analytics & KPIs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Civic Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Civic Categories
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/?category=road" className="hover:text-blue-400 transition-colors">
                  Roads & Pothole Hazards
                </Link>
              </li>
              <li>
                <Link to="/?category=waste" className="hover:text-blue-400 transition-colors">
                  Solid Waste & Sanitation
                </Link>
              </li>
              <li>
                <Link to="/?category=water" className="hover:text-blue-400 transition-colors">
                  Water Supply & Pipe Leaks
                </Link>
              </li>
              <li>
                <Link to="/?category=streetlight" className="hover:text-blue-400 transition-colors">
                  Streetlights & Public Grid
                </Link>
              </li>
              <li>
                <Link to="/?category=drainage" className="hover:text-blue-400 transition-colors">
                  Drainage & Monsoon Overflow
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Municipal Emergency Hotlines
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Police Control: <strong className="text-white">100 / 112</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Fire Brigade: <strong className="text-white">101</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Ambulance className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Medical Emergency: <strong className="text-white">108 / 102</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Civic Complaint Toll-Free: <strong className="text-white">1916</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Women Helpline: <strong className="text-white">1091</strong></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Civic Commitment Banner */}
        <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-semibold text-xs">Citizen Right to Time-Bound Redressal</p>
              <p className="text-[11px] text-slate-400">All submitted grievances are assigned a public tracking ID and verified by municipal ward officers.</p>
            </div>
          </div>
          <Link
            to="/complaints/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 shadow-sm"
          >
            Report an Issue Now
          </Link>
        </div>

        {/* Bottom Bar: Copyright, Legal & Disclaimer */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} CiviConnect. All rights reserved.</span>
            <span>•</span>
            <span>Municipal Grievance Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-slate-300 cursor-pointer">Citizen Charter</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>

          <div className="font-mono text-slate-500 text-[10px]">
           CiviConnect — Connecting citizens with civic services.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
