// client/src/app/candidate/dashboard/page.jsx - FINAL VERSION
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useRoleProtection } from "../../hooks/useRoleProtection";
import { FileText, TrendingUp, CheckCircle, XCircle, Home, Briefcase, RefreshCw } from "lucide-react";

const CandidateDashboard = () => {
  const { isAllowed, isLoading: authLoading, user } = useRoleProtection('candidate');
  
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, reviewing: 0, shortlisted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAllowed) {
      fetchApplications();
      fetchStats();
    }
  }, [isAllowed]);

  const fetchApplications = async () => {
    try {
      console.log('📥 Fetching applications...');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/candidate/my-applications`,
        { withCredentials: true }
      );
      
      console.log('✅ Applications response:', response.data);
      setApplications(response.data.applications || []);
      setError(null);
    } catch (error) {
      console.error("❌ Error fetching applications:", error);
      if (error.response?.status === 404) {
        setApplications([]);
        setError(null);
      } else {
        setError(error.response?.data?.message || "Failed to load applications");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/candidate/stats`,
        { withCredentials: true }
      );
      console.log('📊 Stats response:', response.data);
      setStats(response.data.stats || { total: 0, reviewing: 0, shortlisted: 0, rejected: 0 });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
    fetchStats();
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800 border-blue-200",
      reviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      shortlisted: "bg-green-100 text-green-800 border-green-200",
      interviewed: "bg-purple-100 text-purple-800 border-purple-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      accepted: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      submitted: 'Submitted',
      reviewing: 'Under Review',
      shortlisted: 'Shortlisted',
      interviewed: 'Interviewed',
      rejected: 'Rejected',
      accepted: 'Accepted'
    };
    return statusTexts[status] || 'Pending';
  };

  if (authLoading || !isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
                title="Refresh applications"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => router.push("/jobs")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Applications</p>
                <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-yellow-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Under Review</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.reviewing}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Shortlisted</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.shortlisted}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Rejected</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
            <p className="text-sm text-gray-500 mt-1">
              Track the status of your job applications
            </p>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-indigo-600" />
                </div>
                <p className="text-gray-700 font-semibold text-lg">No applications yet</p>
                <p className="text-sm text-gray-500 mt-2 mb-6">Start applying to jobs to see them here</p>
                <button
                  onClick={() => router.push('/jobs')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Browse Available Jobs
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Application Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {app.jobId?.jobPostTitle || app.jobId?.title || 'Job Title Unavailable'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {app.jobId?.companyName || app.jobId?.company || 'Company Unavailable'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {app.appliedDate || app.appliedAt ? (
                            new Date(app.appliedDate || app.appliedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          ) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Application Status Updates</p>
              <p className="text-sm text-blue-700 mt-1">
                Your application status will be updated in real-time as recruiters review your profile. 
                Click the "Refresh" button to see the latest updates.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;