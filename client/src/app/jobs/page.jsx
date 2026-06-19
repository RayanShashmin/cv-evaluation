"use client";
import { useState, useEffect } from "react";
import { Search, X, Briefcase } from "lucide-react";
import JobCard from "../components/jobs/JobCard";
import JobDetailsModal from "../components/jobs/JobDetailsModal";

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs`, {
          credentials: "include",
        });
        const data = await response.json();
        const jobs = data.data || [];
        setAllJobs(jobs);
        setFilteredJobs(jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredJobs(allJobs);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    const results = allJobs.filter(job => {
      return job.jobPostTitle?.toLowerCase().includes(query) ||
             job.companyName?.toLowerCase().includes(query) ||
             job.jobLocation?.toLowerCase().includes(query) ||
             job.jobType?.toLowerCase().includes(query) ||
             job.jobDepartment?.toLowerCase().includes(query) ||
             job.jobDescription?.toLowerCase().includes(query) ||
             job.shortJobDescription?.toLowerCase().includes(query);
    });
    setFilteredJobs(results);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredJobs(allJobs);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Browse All <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Opportunities</span>
          </h1>
          <p className="text-xl text-gray-600">
            Discover your perfect career match from {allJobs.length}+ opportunities
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex bg-white rounded-2xl p-3 shadow-xl backdrop-blur-sm border border-gray-200">
            <Search className="w-6 h-6 text-gray-400 ml-4 my-auto" />
            <input
              type="text"
              placeholder="Job title, company, location, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow px-4 py-4 text-gray-800 outline-none bg-transparent text-lg"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </div>
          {isSearching && (
            <p className="mt-4 text-gray-600 font-semibold text-center">
              Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Jobs List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSearching ? 'Search Results' : 'All Job Openings'}
            </h2>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
              >
                Clear filters
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                <Briefcase className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
              {isSearching ? (
                <>
                  <Search className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                  <p className="text-2xl font-bold text-gray-700 mb-4">No jobs found</p>
                  <p className="text-gray-500 mb-8 text-lg">
                    We couldn't find any jobs matching "{searchQuery}"
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    View all jobs
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-lg">No job posts available.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  onViewDetails={setSelectedJob}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}