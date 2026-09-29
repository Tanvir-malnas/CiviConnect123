import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Phone,
  AlertTriangle,
  FileText,
  Search,
  ChevronRight,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-600/20">
                <MapPin className="h-5 w-5" />
              </div>

              <span className="text-lg font-bold text-white">
                CiviConnect
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500">
              A simple platform to report civic issues and track municipal
              complaints.
            </p>

            {/* Status */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-400">
                Platform Operational
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 transition-colors hover:text-blue-400"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Public Complaints
                </Link>
              </li>

              <li>
                <Link
                  to="/complaints/new"
                  className="flex items-center gap-2 transition-colors hover:text-blue-400"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Report an Issue
                </Link>
              </li>

              <li>
                <Link
                  to="/my-complaints"
                  className="flex items-center gap-2 transition-colors hover:text-blue-400"
                >
                  <Search className="h-3.5 w-3.5" />
                  Track Complaints
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-white">
              Civic Services
            </h4>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/?category=road"
                  className="group flex items-center justify-between transition-colors hover:text-blue-400"
                >
                  Roads & Potholes
                  <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>

              <li>
                <Link
                  to="/?category=waste"
                  className="group flex items-center justify-between transition-colors hover:text-blue-400"
                >
                  Waste & Sanitation
                  <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>

              <li>
                <Link
                  to="/?category=water"
                  className="group flex items-center justify-between transition-colors hover:text-blue-400"
                >
                  Water Supply
                  <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>

              <li>
                <Link
                  to="/?category=streetlight"
                  className="group flex items-center justify-between transition-colors hover:text-blue-400"
                >
                  Streetlights
                  <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-white">
              Emergency
            </h4>

            <div className="space-y-2.5 text-xs">

              <a
                href="tel:112"
                className="flex items-center justify-between transition-colors hover:text-blue-400"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-rose-400" />
                  Emergency
                </span>
                <strong className="text-white">112</strong>
              </a>

              <a
                href="tel:101"
                className="flex items-center justify-between transition-colors hover:text-blue-400"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-amber-400" />
                  Fire
                </span>
                <strong className="text-white">101</strong>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between transition-colors hover:text-blue-400"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  Ambulance
                </span>
                <strong className="text-white">108</strong>
              </a>

              <a
                href="tel:1916"
                className="flex items-center justify-between transition-colors hover:text-blue-400"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  Civic Helpline
                </span>
                <strong className="text-white">1916</strong>
              </a>

            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-200">
                Your voice matters
              </p>
              <p className="text-[10px] text-slate-500">
                Report civic issues and help improve your community.
              </p>
            </div>
          </div>

          <Link
            to="/complaints/new"
            className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-500"
          >
            Report an Issue
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-7 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-5 text-[10px] text-slate-600 sm:flex-row">

          <span>
            © {new Date().getFullYear()} CiviConnect. All rights reserved.
          </span>

          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-slate-400">
              Privacy
            </span>

            <span className="cursor-pointer hover:text-slate-400">
              Terms
            </span>

            <span className="text-slate-700">•</span>

            <span>
              Civic Grievance Platform
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;