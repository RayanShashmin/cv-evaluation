"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, ChevronRight } from "lucide-react";

export default function JobCard({ job, onViewDetails, index = 0 }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const handleApplyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/apply-now/${job._id}`;
  };

  return (
    <div
      ref={cardRef}
      className={`group relative bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl cursor-pointer overflow-hidden transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-4 flex-1">
            <div className="relative">
              <img
                src={job.photo ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${job.photo}` : "https://via.placeholder.com/50"}
                alt={job.companyName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-300 shadow-lg"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {job.jobPostTitle}
              </h3>
              <p className="text-gray-600 font-semibold mb-3">{job.companyName}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.jobLocation}
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {job.jobType}
                </span>
                {job.jobSalary && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-xs font-semibold rounded-full flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {job.jobSalary}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleApplyClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {job.shortJobDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {job.shortJobDescription}
          </p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Posted: {new Date(job.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={() => onViewDetails(job)}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group"
          >
            View details 
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}