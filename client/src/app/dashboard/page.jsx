"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Briefcase, FileText, Target, TrendingUp, Send, Trash2, ChevronRight, Users, Clock, Award, Search, Menu, X, Home, Settings, LogOut, Plus } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    avgScore: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  // Helper function to safely get ID as string
  const getIdString = (id) => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id._id) return id._id.toString();
    if (typeof id === 'object' && id.toString) return id.toString();
    return String(id);
  };


  const fetchDashboardData = async () => {
  try {
    setLoadingData(true);
    let jobsData = { data: [] };
    let appsData = { data: [] };

    // Fetch jobs
    const jobsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs`,
      { credentials: "include" }
    );
    if (jobsRes.ok) {
      jobsData = await jobsRes.json();
      setJobs(jobsData.data || []);
    }

    // Fetch applications
    const appsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications`,
      { credentials: "include" }
    );
    
    if (appsRes.ok) {
      appsData = await appsRes.json();
      const applicationsList = appsData.applications || appsData.data || [];
      setApplications(applicationsList);

      console.log('📊 Fetching evaluations for applications:', applicationsList.length);

      // Fetch evaluations for each application
      const evalPromises = applicationsList.map(async (app) => {
        const appId = getIdString(app._id);
        console.log('  Fetching evaluation for:', appId);
        
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/${appId}`,
            { credentials: "include" }
          );
          
          if (res.ok) {
            const data = await res.json();
            console.log('  ✅ Evaluation found for:', appId);
            return data.success ? data.data : null;
          } else {
            console.log('  ⚠️ No evaluation for:', appId, '- Status:', res.status);
            return null;
          }
        } catch (error) {
          console.log('  ❌ Error fetching evaluation for:', appId, error.message);
          return null;
        }
      });

      const evalResults = await Promise.all(evalPromises);
      const validEvals = evalResults.filter(e => e !== null);
      
      console.log('✅ Total evaluations found:', validEvals.length);
      setEvaluations(validEvals);

      // Calculate stats
      const avgScore =
        validEvals.length > 0
          ? validEvals.reduce((sum, e) => sum + (e.scores?.overall || 0), 0) / validEvals.length
          : 0;

      setStats({
        totalJobs: jobsData.data?.length || 0,
        totalApplications: applicationsList.length,
        avgScore: Math.round(avgScore),
      });
    }
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
  } finally {
    setLoadingData(false);
  }
};

  // const fetchDashboardData = async () => {
  //   try {
  //     setLoadingData(true);
  //     let jobsData = { data: [] };
  //     let appsData = { data: [] };

  //     // Fetch jobs
  //     const jobsRes = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs`,
  //       { credentials: "include" }
  //     );
  //     if (jobsRes.ok) {
  //       jobsData = await jobsRes.json();
  //       setJobs(jobsData.data || []);
  //     }

  //     // Fetch applications
  //     const appsRes = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications`,
  //       { credentials: "include" }
  //     );
  //     if (appsRes.ok) {
  //       appsData = await appsRes.json();
  //       setApplications(appsData.data || []);

  //       // Fetch evaluations for each application
  //       const evalPromises = (appsData.data || []).map((app) => {
  //         const appId = getIdString(app._id);
  //         console.log('Fetching evaluation for app:', appId);
  //         return fetch(
  //           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/${appId}`
  //         )
  //           .then((res) => (res.ok ? res.json() : null))
  //           .catch(() => null);
  //       });

  //       const evalResults = await Promise.all(evalPromises);
  //       const validEvals = evalResults
  //         .filter((e) => e && e.success)
  //         .map((e) => e.data);
  //       setEvaluations(validEvals);

  //       // Calculate stats
  //       const avgScore =
  //         validEvals.length > 0
  //           ? validEvals.reduce((sum, e) => sum + e.scores.overall, 0) /
  //             validEvals.length
  //           : 0;

  //       setStats({
  //         totalJobs: jobsData.data?.length || 0,
  //         totalApplications: appsData.data?.length || 0,
  //         avgScore: Math.round(avgScore),
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //   } finally {
  //     setLoadingData(false);
  //   }
  // };

  const handleSendFeedback = async (applicationId, e) => {
    e.stopPropagation();
    if (!confirm('Send feedback email to this candidate?')) return;
    setActionLoading(`feedback-${applicationId}`);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/${applicationId}/send-feedback`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('✅ Feedback email sent successfully!');
        
        setEvaluations(prevEvals => 
          prevEvals.map(evaluation => 
            getIdString(evaluation.applicationId) === applicationId
              ? { ...evaluation, feedbackSent: true, feedbackSentAt: new Date() }
              : evaluation
          )
        );
      } else {
        alert(`❌ Failed to send feedback: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('❌ Error sending feedback email. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCandidate = async (applicationId, candidateName, e) => {
    e.stopPropagation();
    if (!confirm(`⚠️ Are you sure you want to delete ${candidateName}?\n\nThis action cannot be undone.`)) {
      return;
    }
    setActionLoading(`delete-${applicationId}`);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/${applicationId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('✅ Candidate deleted successfully');
        
        setEvaluations(prevEvals => 
          prevEvals.filter(evaluation => getIdString(evaluation.applicationId) !== applicationId)
        );
        
        setStats(prevStats => ({
          ...prevStats,
          totalApplications: prevStats.totalApplications - 1
        }));
      } else {
        alert(`❌ Failed to delete: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('❌ Error deleting candidate. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  const getFitLevelStyle = (level) => {
    const styles = {
      excellent: "bg-emerald-100 text-emerald-800",
      good: "bg-blue-100 text-blue-800",
      average: "bg-amber-100 text-amber-800",
      poor: "bg-rose-100 text-rose-800",
    };
    return styles[level] || styles.average;
  };

  // Prepare chart data - only if we have evaluations
  const scoreDistribution = evaluations.length > 0 ? [
    { name: '0-40', value: evaluations.filter(e => e.scores.overall <= 40).length || 0 },
    { name: '41-60', value: evaluations.filter(e => e.scores.overall > 40 && e.scores.overall <= 60).length || 0 },
    { name: '61-80', value: evaluations.filter(e => e.scores.overall > 60 && e.scores.overall <= 80).length || 0 },
    { name: '81-100', value: evaluations.filter(e => e.scores.overall > 80).length || 0 }
  ].filter(item => item.value > 0) : [
    { name: 'No data', value: 1 }
  ];

  const weeklyApplications = applications.length > 0 ? [
    { day: 'Mon', applications: applications.filter(a => a.createdAt && new Date(a.createdAt).getDay() === 1).length },
    { day: 'Tue', applications: applications.filter(a => a.createdAt && new Date(a.createdAt).getDay() === 2).length },
    { day: 'Wed', applications: applications.filter(a => a.createdAt && new Date(a.createdAt).getDay() === 3).length },
    { day: 'Thu', applications: applications.filter(a => a.createdAt && new Date(a.createdAt).getDay() === 4).length },
    { day: 'Fri', applications: applications.filter(a => a.createdAt && new Date(a.createdAt).getDay() === 5).length },
    { day: 'Sat', applications: applications.filter(a => a.createdAt && new Date(a.createdAt).getDay() === 6).length },
    { day: 'Sun', applications: applications.filter(a => a.createdAt && new Date(a.createdAt).getDay() === 0).length }
  ] : [
    { day: 'Mon', applications: 0 },
    { day: 'Tue', applications: 0 },
    { day: 'Wed', applications: 0 },
    { day: 'Thu', applications: 0 },
    { day: 'Fri', applications: 0 },
    { day: 'Sat', applications: 0 },
    { day: 'Sun', applications: 0 }
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
const filteredEvaluations = evaluations.filter(evaluation => 
  evaluation.extractedData?.personalInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  evaluation.extractedData?.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
);
  // const filteredEvaluations = evaluations.filter(evalution => 
  //   eval.extractedData?.personalInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   eval.extractedData?.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  console.log('Debug - Evaluations:', evaluations);
  console.log('Debug - Filtered Evaluations:', filteredEvaluations);
  console.log('Debug - Loading Data:', loadingData);
  console.log('Debug - Search Term:', searchTerm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-2xl z-50 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      AI Recruit
                    </h2>
                    <p className="text-xs text-slate-500">Smart Hiring</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mx-auto">
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all">
              <Home className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Dashboard</span>}
            </button>
            
            <button 
              onClick={() => router.push("/jobs")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <Briefcase className="w-5 h-5 group-hover:text-blue-600" />
              {sidebarOpen && <span className="font-medium">Job Listings</span>}
            </button>

            <button 
              onClick={() => router.push("/applications")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <FileText className="w-5 h-5 group-hover:text-blue-600" />
              {sidebarOpen && <span className="font-medium">Applications</span>}
            </button>

            <button 
              onClick={() => router.push("/evaluations")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <Award className="w-5 h-5 group-hover:text-blue-600" />
              {sidebarOpen && <span className="font-medium">CV Evaluations</span>}
            </button>

            {/* Divider */}
            {sidebarOpen && <div className="border-t border-slate-200 my-4"></div>}
            
            {/* Post Job Button */}
            <button 
              onClick={() => router.push("/post-job")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all group"
            >
              <Plus className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Post a Job</span>}
            </button>

            {/* Manage Posts Button */}
            <button 
              onClick={() => router.push("/manage-post")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <Settings className="w-5 h-5 group-hover:text-emerald-600" />
              {sidebarOpen && <span className="font-medium">Manage Posts</span>}
            </button>

            {sidebarOpen && <div className="border-t border-slate-200 my-4"></div>}

            <button 
              onClick={() => router.push("/settings")}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <Settings className="w-5 h-5 group-hover:text-blue-600" />
              {sidebarOpen && <span className="font-medium">Settings</span>}
            </button>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200/50">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/70 border-b border-slate-200/50 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage your recruitment process with AI</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-80 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {/* <button 
                  onClick={() => router.push("/post-job")}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Post New Job
                </button> */}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Briefcase className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.totalJobs}</span>
                </div>
                <p className="text-blue-100 font-medium">Active Jobs</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Total postings</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.totalApplications}</span>
                </div>
                <p className="text-emerald-100 font-medium">Total Applications</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Users className="w-4 h-4" />
                  <span>All candidates</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.avgScore || '-'}</span>
                </div>
                <p className="text-purple-100 font-medium">Avg CV Score</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Target className="w-4 h-4" />
                  <span>Quality metric</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{evaluations.filter(e => e.scores.overall >= 80).length}</span>
                </div>
                <p className="text-amber-100 font-medium">Top Candidates</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Award className="w-4 h-4" />
                  <span>Score 80+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Weekly Applications
              </h3>
              {loadingData ? (
                <div className="flex items-center justify-center h-64">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyApplications}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="applications" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Score Distribution
              </h3>
              {loadingData ? (
                <div className="flex items-center justify-center h-64">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Recent CV Evaluations
              </h2>
              <button 
                onClick={() => router.push("/evaluations")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group"
              >
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative w-12 h-12">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No evaluations yet</p>
                <p className="text-sm text-slate-400 mt-2">
                  Applications will be automatically evaluated when CVs are uploaded
                </p>
              </div>
            ) : (
              <div>
                {/* Show filtered message if search is active but has no results */}
                {searchTerm && filteredEvaluations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No evaluations found</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Try adjusting your search term
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(searchTerm ? filteredEvaluations : evaluations).slice(0, 5).map((evaluation, index) => {
                  const appId = getIdString(evaluation.applicationId);
                  const candidateName = evaluation.extractedData?.personalInfo?.name || "N/A";
                  
                  return (
                    <div
                      key={evaluation._id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-fadeInUp group relative bg-gradient-to-r from-white to-slate-50/50 p-5 rounded-xl border border-slate-200/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        if (appId && appId !== '[object Object]') {
                          console.log('Navigating to:', `/evaluations/${appId}`);
                          router.push(`/evaluations/${appId}`);
                        } else {
                          console.error('Invalid applicationId:', evaluation.applicationId);
                          alert('Unable to view this evaluation. Invalid ID.');
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {candidateName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {candidateName}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {evaluation.extractedData?.personalInfo?.email || "N/A"}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(evaluation.createdAt).toLocaleDateString()}
                              </span>
                              {evaluation.feedbackSent && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                                  Feedback sent
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-xl font-bold text-lg ${getScoreColor(evaluation.scores.overall)} shadow-sm`}>
                            {evaluation.scores.overall}
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${getFitLevelStyle(evaluation.matchAnalysis.fitLevel)}`}>
                            {evaluation.matchAnalysis.fitLevel}
                          </span>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => handleSendFeedback(appId, e)}
                              disabled={actionLoading === `feedback-${appId}` || evaluation.feedbackSent}
                              className={`p-2 rounded-lg transition-all ${
                                evaluation.feedbackSent
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 shadow-lg shadow-blue-500/30'
                              }`}
                              title={evaluation.feedbackSent ? 'Feedback already sent' : 'Send feedback email'}
                            >
                              {actionLoading === `feedback-${appId}` ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={(e) => handleDeleteCandidate(appId, candidateName, e)}
                              disabled={actionLoading === `delete-${appId}`}
                              className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 hover:scale-110 transition-all shadow-lg shadow-rose-500/30"
                              title="Delete candidate"
                            >
                              {actionLoading === `delete-${appId}` ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  );
                                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Postings Grid */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Your Job Postings
              </h2>
              <button 
                onClick={() => router.push("/manage-post")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group"
              >
                Manage All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No job postings yet</p>
                  <button 
                    onClick={() => router.push("/post-job")}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 font-medium inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Post Your First Job
                  </button>
                </div>
              ) : (
                jobs.map((job, index) => {
                  const jobId = getIdString(job._id);
                  const jobApps = applications.filter(
                    (app) => getIdString(app.jobId?._id || app.jobId) === jobId
                  );
                  
                  return (
                    <div
                      key={job._id}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => router.push(`/job-candidates/${jobId}`)}
                      className="animate-fadeInUp group relative bg-gradient-to-br from-white to-slate-50/50 p-6 rounded-xl border border-slate-200/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {job.jobPostTitle}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">{job.companyName}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-bold">{jobApps.length}</span>
                            </div>
                            <span className="text-sm text-slate-600">
                              {jobApps.length === 1 ? 'candidate' : 'candidates'}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Cards */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <h3 className="text-3xl font-bold text-white mb-2">
                Post a Job and Find the Best Talent with AI
              </h3>
              <p className="text-blue-100 mb-6 text-lg">
                Reach thousands of qualified candidates with AI-powered CV evaluation.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
                  onClick={() => router.push("/post-job")}
                >
                  Post a Job
                </button>
                <button
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 border border-white/30"
                  onClick={() => router.push("/manage-post")}
                >
                  Manage Your Posts
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}