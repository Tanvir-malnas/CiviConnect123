import React, { useState } from 'react';
import {
  ChevronDown,
  MessageCircle,
  Sparkles,
  FileText,
  MapPin,
  Camera,
  Clock3,
  ThumbsUp,
  Plus,
} from 'lucide-react';

const faqs = [
  {
    question: 'What is CiviConnect?',
    answer:
      'CiviConnect is a civic issue reporting platform that helps citizens report local problems and follow their progress. It provides a central place to submit issues, view reported complaints, and stay updated as their status changes.',
    icon: MessageCircle,
  },
  {
    question: 'How do I report a civic issue?',
    answer:
      'Log in to CiviConnect and open the complaint submission page. Select the appropriate category, enter a clear title and detailed description, choose the issue location on the map, and submit your complaint.',
    icon: FileText,
  },
  {
    question: 'What types of issues can I report?',
    answer:
      'You can report Roads & Potholes, Garbage & Waste, Water Supply, Streetlights, Drainage & Sewers, and other civic hazards through CiviConnect.',
    icon: FileText,
  },
  {
    question: 'Can I attach a photo to my complaint?',
    answer:
      'Yes. You can optionally attach a photograph as evidence when submitting a complaint. CiviConnect accepts PNG, JPG, and WEBP images up to 5MB.',
    icon: Camera,
  },
  {
    question: 'Can I select the exact location of an issue?',
    answer:
      'Yes. The complaint form includes an interactive map where you can pin the location of the civic issue. This helps provide a more precise location for the reported problem.',
    icon: MapPin,
  },
  // {
  //   question: 'What happens after I submit a complaint?',
  //   answer:
  //     'After submission, your complaint is added to CiviConnect and can appear in the civic issues feed. Its status can then be updated as it moves through the resolution process.',
  //   icon: Clock3,
  // },
  // {
  //   question: 'Can I track the status of a complaint?',
  //   answer:
  //     'Yes. CiviConnect provides complaint status information so you can follow updates as an issue moves through different stages of the resolution process.',
  //   icon: Clock3,
  // },
  // {
  //   question: 'What do the complaint statuses mean?',
  //   answer:
  //     'Complaints can move through statuses such as Submitted, Verified, Assigned, In Progress, Resolved, or Rejected. These statuses indicate the current stage of the complaint.',
  //   icon: Clock3,
  // },
  // {
  //   question: 'Can other citizens support a complaint?',
  //   answer:
  //     'Yes. Citizens can upvote complaints in the public feed. This allows other users to show support for issues that affect their community.',
  //   icon: ThumbsUp,
  // },
  // {
  //   question: 'What can Civi Assistant help me with?',
  //   answer:
  //     'Civi Assistant can help answer questions related to CiviConnect, including how to report civic issues and how the platform works. For questions outside CiviConnect, the assistant will guide you back to the platform.',
  //   icon: Sparkles,
  // },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[15%] w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-10 right-[15%] w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Same width as Home main section */}
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HELP CENTER</span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about reporting civic issues,
            tracking complaints, and using CiviConnect.
          </p>
        </div>

        {/* FAQ Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-8 items-start">
          {/* Left Information Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 p-7 sm:p-8 text-white shadow-xl shadow-blue-900/10 lg:sticky lg:top-6">
            {/* Decorative circles */}
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-16 -bottom-20 w-52 h-52 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                CiviConnect Help
              </p>

              <h3 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">
                Have questions?
                <br />
                We've got answers.
              </h3>

              <p className="text-sm text-blue-100 leading-6 mt-4">
                Learn how to report civic problems, add evidence,
                select locations, and follow complaint updates.
              </p>

              <div className="mt-7 pt-6 border-t border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Need more help?
                    </p>
                    <p className="text-xs text-blue-200 mt-0.5">
                      Ask Civi Assistant
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Civi Assistant
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const Icon = faq.icon;

              return (
                <div
                  key={faq.question}
                  className={`group bg-white rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-blue-200 shadow-lg shadow-blue-500/5'
                      : 'border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  {/* Question */}
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    {/* Number */}
                    <span
                      className={`hidden sm:flex shrink-0 w-8 h-8 rounded-lg items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                        isOpen
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Icon */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Question Text */}
                    <span
                      className={`flex-1 text-sm sm:text-[15px] font-bold transition-colors duration-300 ${
                        isOpen ? 'text-blue-700' : 'text-slate-800'
                      }`}
                    >
                      {faq.question}
                    </span>

                    {/* Plus / Minus */}
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-blue-600 border-blue-600 text-white rotate-45'
                          : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>

                  {/* Answer */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen
                        ? 'grid-rows-[1fr]'
                        : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 sm:pl-[7.75rem]">
                        <div className="border-l-2 border-blue-100 pl-4">
                          <p className="text-sm text-slate-500 leading-6">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Couldn't find your answer?
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Civi Assistant can help you with CiviConnect-related questions.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-sm shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Ask Assistant
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

