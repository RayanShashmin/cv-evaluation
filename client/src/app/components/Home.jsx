"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Zap, Target, TrendingUp, Search, X, Briefcase, MapPin, Clock, DollarSign, Users, Award, ChevronRight, ArrowRight } from "lucide-react";
import RecruitmentChatbot from "@/app/components/RecruitmentChatbot";
//import Home from "@/app/components/chatbot";



const JobCard = ({ job, onViewDetails, index }) => {
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
    // Navigate to apply page with job ID
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
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-4 flex-1">
            <div className="relative">
              <img
                src={job.photo || "https://via.placeholder.com/50"}
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
                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-[#1800ad] text-xs font-semibold rounded-full flex items-center gap-1">
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
            className="px-6 py-3 bg-[#1800ad] text-white font-bold rounded-xl hover:bg-[#1200a0] transition-all duration-300 shadow-lg shadow-[#1800ad]/30 hover:shadow-xl hover:shadow-[#1800ad]/40 transform hover:scale-105 flex items-center gap-2"
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
            className="text-sm font-bold text-[#1800ad] hover:text-[#1200a0] transition-colors flex items-center gap-1 group"
          >
            View details 
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
    </div>
  );
};

const JobDetailsModal = ({ job, onClose }) => {
  if (!job) return null;

  const postedDate = new Date(job.postDate || job.createdAt);
  const deadlineDate = job.deadlineDate ? new Date(job.deadlineDate) : null;
  const isExpired = deadlineDate ? deadlineDate < new Date() : false;

  const handleApplyClick = (e) => {
    e.preventDefault();
    // Navigate to apply page with job ID
    window.location.href = `/apply-now/${job._id}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-[#1800ad]">
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
            src={job.photo || "https://via.placeholder.com/50"}
            alt={job.companyName}
            className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg"
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">{job.companyName}</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-[#1800ad] text-white text-sm rounded-full font-semibold flex items-center gap-1">
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
              className={`px-8 py-3 ${isExpired ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1800ad] hover:bg-[#1200a0]'} text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#1800ad]/30 hover:shadow-xl hover:shadow-[#1800ad]/40 transform hover:scale-105 flex items-center gap-2`}
              disabled={isExpired}
            >
              {isExpired ? 'Position Closed' : <>Apply Now <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
       
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="w-16 h-16 bg-[#1800ad] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#1800ad]/30">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

const StatCard = ({ value, label, index }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    const target = parseInt(value.replace(/\D/g, ''));
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <div ref={cardRef} className="text-center">
      <div className="text-5xl font-bold text-[#1800ad] drop-shadow-[0_0_20px_rgba(24,0,173,0.3)] mb-2">
        {count.toLocaleString()}{value.includes('+') ? '+' : ''}
      </div>
      <div className="text-white font-semibold">{label}</div>
    </div>
  );
};

export default function Hero() {
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
    
    // Fetch real jobs from API
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
             job.jobType?.toLowerCase().includes(query);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/white-blur.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for better text visibility 
        <div className="absolute inset-0 bg-black/60" />*/}

        <div className={`relative z-10 text-center text-white px-6 max-w-6xl mx-auto transition-all duration-1000 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className={`inline-flex items-center gap-2 bg-[#1800ad]/30 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-[#1800ad]/50 transition-all duration-1000 delay-200 ${heroVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <Sparkles className="w-5 h-5 text-white" />
            <span className="font-semibold">AI-Powered Recruitment Platform</span>
          </div>
          
          <h1 className={`text-7xl font-extrabold mb-6 leading-tight transition-all duration-1000 delay-300 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Find Your Dream Job
            <br />
            <span className="text- drop-shadow-[0_0_30px_rgba(24,0,173,0.5)]">
              Powered by AI
            </span>
          </h1>
          
          <p className={`text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Revolutionary CV evaluation and intelligent matching for the perfect career opportunity
          </p>

          {/* Search Bar */}
          <div className={`max-w-3xl mx-auto mb-12 transition-all duration-1000 delay-700 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-[#1800ad]/20">
              <Search className="w-6 h-6 text-[#1800ad] ml-4 my-auto" />
              <input
                type="text"
                placeholder="Job title, company, location, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow px-4 py-4 text-gray-800 outline-none bg-transparent text-lg placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-3 text-gray-400 hover:text-[#1800ad] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleSearch}
                className="px-8 py-4 bg-[#1800ad] text-white font-bold rounded-xl hover:bg-[#1200a0] transition-all duration-300 shadow-lg shadow-[#1800ad]/30 hover:shadow-xl hover:shadow-[#1800ad]/40 transform hover:scale-105 flex items-center gap-2"
              >
                Search Jobs
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            {isSearching && (
              <p className="mt-4 text-white font-semibold text-lg animate-in fade-in duration-300">
                Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            )}
          </div>


          {/* Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-900 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <StatCard value="1000+" label="Active Jobs" index={0} />
            <StatCard value="500+" label="Companies" index={1} />
            <StatCard value="5000+" label="Success Stories" index={2} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white rotate-90" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of recruitment with AI-powered tools that make hiring smarter and faster
            </p>
             {/* <RecruitmentAssistant /> */}
             <RecruitmentChatbot />
             {/* <Home /> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Sparkles}
              title="AI CV Evaluations"
              description="Our advanced AI evaluates CVs in seconds, matching candidates with precision based on skills, experience, and cultural fit."
              index={0}
            />
            <FeatureCard
              icon={Target}
              title="Smart Matching"
              description="Intelligent algorithms connect the right talent with the right opportunities, saving time and improving hire quality."
              index={1}
            />
            <FeatureCard
              icon={Zap}
              title="Instant Results"
              description="Get real-time insights and recommendations. No more waiting days for candidate screening and evaluation."
              index={2}
            />
          </div>
        </div>
      </div>

      {/* Popular Jobs Section - Show only 6 jobs */}
      <div className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Popular Opportunities
            </h2>
            <p className="text-xl text-gray-600">
              Hand-picked positions from top companies
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
              <Search className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <p className="text-2xl font-bold text-gray-700 mb-4">No jobs available</p>
              <p className="text-gray-500 text-lg">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-12">
                {filteredJobs.slice(0, 6).map((job, index) => (
                  <JobCard 
                    key={job._id} 
                    job={job} 
                    onViewDetails={setSelectedJob}
                    index={index}
                  />
                ))}
              </div>
              
              {/* Explore More Button - Only show if there are more than 6 jobs */}
              {allJobs.length > 6 && (
                <div className="text-center">
                  <a 
                    href="/jobs"
                    className="inline-flex items-center gap-3 px-12 py-5 bg-[#1800ad] text-white font-bold rounded-xl hover:bg-[#1200a0] transition-all duration-300 shadow-lg shadow-[#1800ad]/30 hover:shadow-xl hover:shadow-[#1800ad]/40 transform hover:scale-105"
                  >
                    <Briefcase className="w-6 h-6" />
                    Explore All {allJobs.length} Jobs
                    <ArrowRight className="w-6 h-6" />
                  </a>
                  <p className="text-gray-500 mt-4 text-sm">
                    Discover {allJobs.length - 6} more opportunities waiting for you
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#1800ad] rounded-3xl p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join thousands of companies using AI-powered recruitment to find the perfect candidates faster
            </p>
            <button className="px-12 py-5 bg-white text-[#1800ad] font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto">
              Get Started Free
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
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