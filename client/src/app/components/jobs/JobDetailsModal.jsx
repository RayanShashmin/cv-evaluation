"use client";
import { X, MapPin, Briefcase, DollarSign, ArrowRight, Sparkles } from "lucide-react";

export default function JobDetailsModal({ job, onClose }) {
  if (!job) return null;

  const postedDate = new Date(job.postDate || job.createdAt);
  const deadlineDate = job.deadlineDate ? new Date(job.deadlineDate) : null;
  const isExpired = deadlineDate ? deadlineDate < new Date() : false;

  const handleApplyClick = (e) => {
    e.preventDefault();
    window.location.href = `/apply-now/${job._id}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {job.jobPostTitle}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <img
            src={job.photo ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${job.photo}` : "https://via.placeholder.com/50"}
            alt={job.companyName}
            className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg"
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">{job.companyName}</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-semibold flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.jobLocation}
              </span>
              <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-semibold flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.jobType}
              </span>
              {job.jobSalary && (
                <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full font-semibold flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {job.jobSalary}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-sm text-blue-600 mb-1 font-semibold">Posted Date</p>
              <p className="font-bold text-gray-900">
                {postedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className={`bg-gradient-to-br ${isExpired ? 'from-red-50 to-red-100' : 'from-green-50 to-green-100'} p-4 rounded-xl`}>
              <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-green-600'} mb-1 font-semibold`}>Application Deadline</p>
              <p className={`font-bold ${isExpired ? 'text-red-700' : 'text-gray-900'}`}>
                {deadlineDate ? deadlineDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "Not specified"}
              </p>
              {deadlineDate && (
                <p className={`text-xs mt-1 font-semibold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {isExpired ? '⚠️ This position has closed' : '✓ Accepting applications'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {job.shortJobDescription && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  About This Position
                </h3>
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{job.shortJobDescription}</p>
              </div>
            )}
            {job.jobDescription && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Job Description</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.jobDescription}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              {deadlineDate && (
                <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {isExpired ? `Closed on ${deadlineDate.toLocaleDateString()}` : `Open until ${deadlineDate.toLocaleDateString()}`}
                </p>
              )}
            </div>
            <button 
              onClick={handleApplyClick}
              className={`px-8 py-3 ${isExpired ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2`}
              disabled={isExpired}
            >
              {isExpired ? 'Position Closed' : <>Apply Now <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}